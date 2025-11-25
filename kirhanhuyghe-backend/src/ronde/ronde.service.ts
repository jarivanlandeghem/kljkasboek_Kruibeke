// src/ronde/ronde.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle } from '../drizzle/drizzle.provider';
import type { DatabaseProvider } from '../drizzle/drizzle.provider';
import {
  rondes,
  rondeHuizen,
  rondeLeiding,
  rondeBewoners,
} from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateRondeDto } from './ronde.dto';

@Injectable()
export class RondeService {
  private readonly logger = new Logger(RondeService.name);

  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async processRondeUpload(dto: CreateRondeDto) {
    return await this.db.transaction(async (tx) => {
      // 1. Ronde Aanmaken
      const [rondeRes] = await tx
        .insert(rondes)
        .values({ naam: dto.naam })
        .$returningId();
      const rondeId = rondeRes.rondeID;

      // =========================================================
      // 2. LEIDING VERWERKEN
      // =========================================================
      const leidingInserts = [];
      for (const l of dto.leiding) {
        // SAMENVOEGEN: "Straat 12, 9000 Gent, Belgium"
        // Check op postcode om 'undefined' in string te voorkomen
        const pc = l.postcode ? l.postcode : '';
        const fullAdres = `${l.straatEnNummer}, ${pc} ${l.gemeente}, Belgium`;

        const coords = await this.geocodePhoton(fullAdres);
        leidingInserts.push({
          rondeID: rondeId,
          naam: l.naam,
          adres: fullAdres,
          lat: coords?.lat,
          lon: coords?.lon,
        });
        await this.delay(50); // best practice -> niet direct na elkaar om overload op de server te voorkomen
      }
      if (leidingInserts.length)
        await tx.insert(rondeLeiding).values(leidingInserts);

      // =========================================================
      // 3. HUIZEN GROEPEREN & SAMENVOEGEN
      // =========================================================
      const huizenMap = new Map<
        string,
        { adres: string; bewoners: string[] }
      >();

      for (const h of dto.huizen) {
        // Unieke key maken op basis van de 3 kolommen
        // Veilige check op postcode
        const pcKey = h.postcode ? h.postcode.trim() : '';
        const uniekeKey =
          `${h.straatEnNummer.trim()}, ${pcKey} ${h.gemeente.trim()}`.toLowerCase();

        let huisData = huizenMap.get(uniekeKey);

        if (!huisData) {
          // Format voor opslag en API
          const pcDisplay = h.postcode ? h.postcode : '';
          const samengesteldAdres = `${h.straatEnNummer}, ${pcDisplay} ${h.gemeente}, Belgium`;

          huisData = {
            adres: samengesteldAdres,
            bewoners: [],
          };
          huizenMap.set(uniekeKey, huisData);
        }

        huisData.bewoners.push(h.naam);
      }

      this.logger.log(
        `CSV bevat ${dto.huizen.length} leden, samengevoegd tot ${huizenMap.size} unieke adressen.`,
      );

      // 4. Geocoden & Opslaan
      for (const data of huizenMap.values()) {
        const coords = await this.geocodePhoton(data.adres);

        const [huisRes] = await tx
          .insert(rondeHuizen)
          .values({
            rondeID: rondeId,
            adres: data.adres,
            lat: coords?.lat,
            lon: coords?.lon,
            heeftCoordinaten: !!coords,
          })
          .$returningId();

        if (data.bewoners.length > 0) {
          await tx.insert(rondeBewoners).values(
            data.bewoners.map((naam) => ({
              rondeHuisID: huisRes.rondeHuisID,
              naam,
            })),
          );
        }
        await this.delay(50);
      }

      // 5. Data opnieuw ophalen
      const savedHuizen = await tx
        .select()
        .from(rondeHuizen)
        .where(eq(rondeHuizen.rondeID, rondeId));
      const savedLeiding = await tx
        .select()
        .from(rondeLeiding)
        .where(eq(rondeLeiding.rondeID, rondeId));

      // 6. Algoritme
      const updates = this.berekenOptimaleVerdeling(savedHuizen, savedLeiding);

      // 7. Opslaan Updates
      for (const update of updates) {
        await tx
          .update(rondeHuizen)
          .set({ toegewezenLeidingID: update.leidingID })
          .where(eq(rondeHuizen.rondeHuisID, update.huisID));
      }

      return {
        succes: true,
        rondeId,
        uniekeHuizen: savedHuizen.length,
        huizenVerdeeld: updates.length,
      };
    });
  }

  async getResultaatVoorLeiding(rondeId: number) {
    const result = await this.db.query.rondeLeiding.findMany({
      where: eq(rondeLeiding.rondeID, rondeId),
      with: {
        huizen: {
          with: { bewoners: true },
        },
      },
    });

    // Cast naar any[] om TS errors met missende relaties te voorkomen als schema niet perfect matcht
    return (result as any[]).map((l) => ({
      leidingID: l.rondeLeidingID,
      leidingNaam: l.naam,
      totaalHuizen: l.huizen?.length || 0,
      route: (l.huizen || []).map((h: any) => ({
        adres: h.adres,
        bewoners: h.bewoners.map((b: any) => b.naam).join(', '),
        // link naar google maps
        link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.adres)}`,
      })),
    }));
  }

  private berekenOptimaleVerdeling(huizen: any[], leiding: any[]) {
    // 1. Filter geldige locaties
    const validHuizen = huizen.filter((h) => h.lat && h.lon);
    const validLeiding = leiding.filter((l) => l.lat && l.lon);
    if (!validLeiding.length || !validHuizen.length) return [];

    // 2. Setup $
    const leidingMap = validLeiding.map((l) => ({
      id: l.rondeLeidingID,
      lat: Number(l.lat),
      lon: Number(l.lon),
      assigned: [] as any[],
    }));

    // 3. Quota bepalen
    const baseQuota = Math.floor(validHuizen.length / leidingMap.length);
    let remainder = validHuizen.length % leidingMap.length;

    // 4. Initiële vulling (Simpel sequentieel)
    let huisIdx = 0;
    for (const l of leidingMap) {
      const quota = baseQuota + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      for (let i = 0; i < quota; i++) {
        if (huisIdx < validHuizen.length) {
          l.assigned.push(validHuizen[huisIdx]);
          huisIdx++;
        }
      }
    }

    // 5. Optimalisatie Loop (Swapping)
    // Ruil huizen tussen leiding tot de totale afstand niet meer verbetert
    let improved = true;
    let iterations = 0;
    const MAX_LOOPS = 5000;

    while (improved && iterations < MAX_LOOPS) {
      improved = false;
      iterations++;

      // Vergelijk elke leiding (A) met elke andere (B)
      for (let i = 0; i < leidingMap.length; i++) {
        for (let j = i + 1; j < leidingMap.length; j++) {
          const personA = leidingMap[i];
          const personB = leidingMap[j];

          // Check elk huis van A tegen elk huis van B
          for (let aIdx = 0; aIdx < personA.assigned.length; aIdx++) {
            for (let bIdx = 0; bIdx < personB.assigned.length; bIdx++) {
              const huisA = personA.assigned[aIdx];
              const huisB = personB.assigned[bIdx];

              // Huidige afstand
              const currentCost =
                this.getDistSq(personA, huisA) + this.getDistSq(personB, huisB);

              // Afstand na wissel
              const swapCost =
                this.getDistSq(personA, huisB) + this.getDistSq(personB, huisA);

              // Als wissel beter is (kleinere afstand), doe het
              if (swapCost < currentCost - 0.00001) {
                personA.assigned[aIdx] = huisB;
                personB.assigned[bIdx] = huisA;
                improved = true;
              }
            }
          }
        }
      }
    }

    // 6. Resultaat formatteren
    const resultaat = [];
    for (const person of leidingMap) {
      for (const huis of person.assigned) {
        resultaat.push({ huisID: huis.rondeHuisID, leidingID: person.id });
      }
    }
    return resultaat;
  }

  private getDistSq(
    p1: { lat: number; lon: number },
    p2: { lat: any; lon: any },
  ) {
    const dx = p1.lat - Number(p2.lat);
    const dy = p1.lon - Number(p2.lon);
    return dx * dx + dy * dy;
  }

  private async geocodePhoton(
    adres: string,
  ): Promise<{ lat: string; lon: string } | null> {
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(adres)}&limit=1`;

      const response = await fetch(url);
      if (!response.ok) return null;

      const data: any = await response.json();
      if (data.features?.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return { lat: String(lat), lon: String(lon) };
      }
      return null;
    } catch (e) {
      // Log de fout maar breek niet af
      this.logger.warn(`Geocoding fail voor ${adres}: ${e}`);
      return null;
    }
  }

  private delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
