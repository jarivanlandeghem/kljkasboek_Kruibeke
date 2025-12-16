/* istanbul ignore file */
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

interface PhotonResponse {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
  }>;
}

interface Locatable {
  lat: string | null;
  lon: string | null;
}

interface HuisEntity extends Locatable {
  rondeHuisID: number;
}

interface LeidingEntity extends Locatable {
  rondeLeidingID: number;
}

@Injectable()
export class RondeService {
  private readonly logger = new Logger(RondeService.name);

  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async processRondeUpload(dto: CreateRondeDto) {
    return await this.db.transaction(async (tx) => {
      const [rondeRes] = await tx
        .insert(rondes)
        .values({ naam: dto.naam })
        .$returningId();
      const rondeId = rondeRes.rondeID;

      const leidingInserts = [];
      for (const l of dto.leiding) {
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
        await this.delay(50);
      }
      if (leidingInserts.length)
        await tx.insert(rondeLeiding).values(leidingInserts);

      const huizenMap = new Map<
        string,
        { adres: string; bewoners: string[] }
      >();

      for (const h of dto.huizen) {
        const pcKey = h.postcode ? h.postcode.trim() : '';
        const uniekeKey =
          `${h.straatEnNummer.trim()}, ${pcKey} ${h.gemeente.trim()}`.toLowerCase();

        let huisData = huizenMap.get(uniekeKey);

        if (!huisData) {
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

      this.logger.log({
        message: 'CSV processed',
        count: dto.huizen.length,
        uniqueAddresses: huizenMap.size,
      });

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

      const savedHuizen = await tx
        .select()
        .from(rondeHuizen)
        .where(eq(rondeHuizen.rondeID, rondeId));
      const savedLeiding = await tx
        .select()
        .from(rondeLeiding)
        .where(eq(rondeLeiding.rondeID, rondeId));

      const updates = this.berekenOptimaleVerdeling(savedHuizen, savedLeiding);

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

    return result.map((l) => ({
      leidingID: l.rondeLeidingID,
      leidingNaam: l.naam,
      totaalHuizen: l.huizen.length,
      route: l.huizen.map((h) => ({
        adres: h.adres,
        bewoners: h.bewoners.map((b) => b.naam).join(', '),
        link: `https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(h.adres)}`,
      })),
    }));
  }

  // ALGORITME
  private berekenOptimaleVerdeling(
    huizen: HuisEntity[],
    leiding: LeidingEntity[],
  ) {
    // filter alleen huizen en leiding met geldige coördinaten
    const validHuizen = huizen.filter((h) => h.lat && h.lon);
    const validLeiding = leiding.filter((l) => l.lat && l.lon);
    if (!validLeiding.length || !validHuizen.length) return [];

    // maak een array met alle leiders en hun huizen (leeg te beginnen)
    const leidingMap = validLeiding.map((l) => ({
      id: l.rondeLeidingID,
      lat: Number(l.lat),
      lon: Number(l.lon),
      assigned: [] as HuisEntity[],
    }));

    // stap één: verdeel huizen eerlijk
    // bereken hoeveel huizen per leider
    const baseQuota = Math.floor(validHuizen.length / leidingMap.length);
    // en hoeveel huizen zijn er over
    let remainder = validHuizen.length % leidingMap.length;

    // geef elk leider hun quota + eventueel eentje extra
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

    // stap twee: optimalisatie van afstanden
    // deze lus kijkt of we huizen kunnen ruilen voor kortere routes
    let improved = true;
    let iterations = 0;
    const MAX_LOOPS = 5000;

    while (improved && iterations < MAX_LOOPS) {
      improved = false;
      iterations++;

      // vergelijk alle paren leiders met elkaar
      for (let i = 0; i < leidingMap.length; i++) {
        for (let j = i + 1; j < leidingMap.length; j++) {
          const personA = leidingMap[i];
          const personB = leidingMap[j];

          // voor elk huis van leider a en elk huis van leider b
          for (let aIdx = 0; aIdx < personA.assigned.length; aIdx++) {
            for (let bIdx = 0; bIdx < personB.assigned.length; bIdx++) {
              const huisA = personA.assigned[aIdx];
              const huisB = personB.assigned[bIdx];

              // bereken huidige kosten: afstand a naar zijn huis plus b naar zijn huis
              const currentCost =
                this.getDistSq(personA, huisA) + this.getDistSq(personB, huisB);

              // bereken kosten als we zouden ruilen
              const swapCost =
                this.getDistSq(personA, huisB) + this.getDistSq(personB, huisA);

              // wissel alleen als het echt beter is (en niet gelijk)
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

    // zet alle toewijzingen in een lijst
    const resultaat = [];
    for (const person of leidingMap) {
      for (const huis of person.assigned) {
        resultaat.push({ huisID: huis.rondeHuisID, leidingID: person.id });
      }
    }
    return resultaat;
  }

  // bereken gekwadrateerde afstand
  private getDistSq(
    p1: { lat: number; lon: number },
    p2: { lat: string | null; lon: string | null },
  ) {
    const dx = p1.lat - Number(p2.lat);
    const dy = p1.lon - Number(p2.lon);
    return dx * dx + dy * dy;
  }

  // hulpklasse voor het ophalen van de lat en lon door de API van komoot. er wordt telkens 50ms gewacht uit beleefdheid.
  private async geocodePhoton(
    adres: string,
  ): Promise<{ lat: string; lon: string } | null> {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(adres)}&limit=1`;
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as PhotonResponse;

        if (
          data &&
          Array.isArray(data.features) &&
          data.features.length > 0 &&
          data.features[0].geometry?.coordinates
        ) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          return { lat: String(lat), lon: String(lon) };
        }
        return null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (attempt === maxRetries) {
          this.logger.warn({
            message: 'Geocoding failed after retries',
            address: adres,
            error: errorMessage,
          });
          return null;
        }
        await this.delay(200 * attempt);
      }
    }
    return null;
  }

  private delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
