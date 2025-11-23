// src/transactie/transactie.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { TRANSACTION_DATA, Transactie } from '../api/data/mock_data';
import { eq } from 'drizzle-orm';
import {
    CreateTransactieRequestDto,
    TransactieListResponseDto,
    TransactieResponseDto,
    UpdateTransactieDto,
} from './transacties.dto';
import {
    type DatabaseProvider,
    InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { transacties, transactieCategorie, users } from '../drizzle/schema';
import { categorieen } from '../drizzle/schema';
import { MailService } from '../mail/mail.service';
// 👇 AANGEPAST: Default import gebruiken i.p.v. namespace import
import PDFDocument from 'pdfkit';

@Injectable()
export class TransactieService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
    private readonly mailService: MailService,
  ) {}

  // Alle transacties ophalen
  async getAll(): Promise<TransactieListResponseDto> {
    const items = await this.db.query.transacties.findMany({
      with: { categorieKoppelingen: true },
    });

    const allCategories = await this.db.query.categorieen.findMany();
    const catMap = new Map(
      allCategories.map((c) => [c.categorieID, c.categorienaam]),
    );

    const itemsWithDetails = items.map((t) => {
      const koppelingen = t.categorieKoppelingen || [];
      const categorieDetails = koppelingen.map((k) => ({
        categorieID: k.categorieID,
        categorienaam: catMap.get(k.categorieID) ?? String(k.categorieID),
      }));
      return {
        ...t,
        categorieDetails,
      };
    });

    const userIds = Array.from(
      new Set(itemsWithDetails.map((it) => it.userID).filter(Boolean)),
    );
    const userMap = new Map<
      number,
      { voornaam: string; familienaam: string }
    >();
    for (const id of userIds) {
      try {
        const [dbUser] = await this.db
          .select()
          .from(users)
          .where(eq(users.userid, id))
          .limit(1);
        if (dbUser) {
          userMap.set(id, {
            voornaam: dbUser.voornaam,
            familienaam: dbUser.familienaam,
          });
        }
      } catch (e) {
        console.log(e);
      }
    }

    const itemsWithAuthors = itemsWithDetails.map((it) => ({
      ...it,
      author: userMap.has(it.userID) ? userMap.get(it.userID) : null,
    }));

    return { items: itemsWithAuthors };
  }

  // Transactie op ID ophalen
  async getById(id: number): Promise<TransactieResponseDto> {
    if (this.db) {
      const transactie = await this.db.query.transacties.findFirst({
        where: eq(transacties.transactieID, id),
        with: {
          categorieKoppelingen: true,
        },
      });

      if (!transactie) {
        throw new NotFoundException('Er bestaat geen transactie met deze ID');
      }

      return {
        transactieID: transactie.transactieID,
        rekeningID: transactie.rekeningID,
        userID: transactie.userID,
        beschrijving: transactie.beschrijving,
        in_uit: transactie.in_uit,
        bedrag: Number(transactie.bedrag),
        datum: String(transactie.datum),
      };
    }

    const transactie = TRANSACTION_DATA.find(
      (t: Transactie) => t.transactieID === id,
    );
    if (!transactie) {
      throw new NotFoundException('Er bestaat geen transactie met deze ID');
    }

    return this.toResponseDto(transactie);
  }

  // Nieuwe transactie aanmaken
  async create(
    transactie: CreateTransactieRequestDto,
  ): Promise<TransactieResponseDto> {
    const transactieToInsert = {
      ...transactie,
    };

    const [newTransactieIdObject] = await this.db
      .insert(transacties)
      .values(transactieToInsert)
      .$returningId();

    const newTransactieId = newTransactieIdObject.transactieID;
    const resultaat = await this.getById(newTransactieId);
    return resultaat;
  }

  // UPDATE
  async updateById(
    id: number,
    updateDto: UpdateTransactieDto,
  ): Promise<TransactieResponseDto | undefined> {
    let existingTransactie: TransactieResponseDto;
    try {
      existingTransactie = await this.getById(id);
    } catch {
      return undefined;
    }

    const updatedTransactie: TransactieResponseDto = {
      transactieID: id,
      rekeningID: updateDto.rekeningID ?? existingTransactie.rekeningID,
      userID: updateDto.userID ?? existingTransactie.userID,
      beschrijving: updateDto.beschrijving ?? existingTransactie.beschrijving,
      in_uit: updateDto.in_uit ?? existingTransactie.in_uit,
      bedrag: updateDto.bedrag ?? existingTransactie.bedrag,
      datum: updateDto.datum ?? existingTransactie.datum,
    };

    try {
      console.log('Updating transactie (id):', id, 'payload:', updatedTransactie);
      await this.db
        .update(transacties)
        .set(updatedTransactie)
        .where(eq(transacties.transactieID, id));
    } catch (err) {
      console.error('Error while updating transactie id', id, 'payload:', updatedTransactie, 'error:', err);
      throw err;
    }

    if (updateDto.categorieIDs) {
      await this.updateCategorieKoppelingen(id, updateDto.categorieIDs);
    }

    return updatedTransactie;
  }

  async updateCategorieKoppelingen(id: number, categorieIDs: number[]) {
    await this.db
      .delete(transactieCategorie)
      .where(eq(transactieCategorie.transactieID, id));

    const toInsert = (categorieIDs || []).map((categorieID) => ({
      transactieID: id,
      categorieID,
    }));

    if (toInsert.length > 0) {
      await this.db.insert(transactieCategorie).values(toInsert);
    }
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(transacties)
      .where(eq(transacties.transactieID, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen transactie met deze ID');
    }
  }

  private toResponseDto(transactie: Transactie): TransactieResponseDto {
    return {
      transactieID: transactie.transactieID,
      rekeningID: transactie.rekeningID,
      userID: transactie.userID,
      beschrijving: transactie.beschrijving,
      in_uit: transactie.in_uit,
      bedrag: transactie.bedrag,
      datum: transactie.datum,
    };
  }

  // RAPPORT GENEREREN
  async generateAndMailReport(
    userId: number,
    userEmail: string,
    firstName: string,
  ): Promise<void> {
    const rawData = await this.db
      .select({
        bedrag: transacties.bedrag,
        datum: transacties.datum,
        beschrijving: transacties.beschrijving,
        in_uit: transacties.in_uit,
        categorieNaam: categorieen.categorienaam,
      })
      .from(transacties)
      .leftJoin(
        transactieCategorie,
        eq(transacties.transactieID, transactieCategorie.transactieID),
      )
      .leftJoin(
        categorieen,
        eq(transactieCategorie.categorieID, categorieen.categorieID),
      )
      .where(eq(transacties.userID, userId));

    if (rawData.length === 0) {
      throw new NotFoundException(
        'Geen transacties gevonden om te rapporteren.',
      );
    }

    const grouped = new Map<string, { in: any[]; out: any[] }>();

    rawData.forEach((row) => {
      const catName = row.categorieNaam || 'Overige / Geen Categorie';

      if (!grouped.has(catName)) {
        grouped.set(catName, { in: [], out: [] });
      }

      const group = grouped.get(catName);

      if (group) {
        const bedrag = Number(row.bedrag);

        if (row.in_uit === 'IN') {
          group.in.push({ ...row, bedrag });
        } else {
          group.out.push({ ...row, bedrag });
        }
      }
    });

    const pdfBuffer = await this.createPdfBuffer(grouped, firstName);

    await this.mailService.sendTransactionReport(
      userEmail,
      firstName,
      pdfBuffer,
    );
  }

  // HELPER: PDF GENERATIE LOGICA
  private createPdfBuffer(
    groupedData: Map<string, { in: any[]; out: any[] }>,
    name: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 👇 Nu werkt 'new PDFDocument' omdat de import is gefixt
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 👇 AANGEPAST: Zorg dat reject altijd een Error krijgt
      doc.on('error', (err: any) => {
        if (err instanceof Error) {
          reject(err);
        } else {
          reject(new Error(String(err)));
        }
      });

      // --- PDF CONTENT ---

      doc.fontSize(20).text(`Transactie Rapport: ${name}`, { align: 'center' });
      doc
        .fontSize(12)
        .text(`Gegenereerd op: ${new Date().toLocaleDateString()}`, {
          align: 'center',
        });
      doc.moveDown(2);

      groupedData.forEach((data, categoryName) => {
        if (doc.y > 650) doc.addPage();

        doc
          .fontSize(16)
          .fillColor('#2c3e50')
          .text(categoryName, { underline: true });
        doc.moveDown(0.5);

        let totalIn = 0;
        let totalOut = 0;

        if (data.in.length > 0) {
          doc.fontSize(12).fillColor('green').text('INKOMSTEN (IN)');
          this.drawTable(doc, data.in);
          totalIn = data.in.reduce((sum, t) => sum + t.bedrag, 0);
          doc.moveDown(1);
        }

        if (data.out.length > 0) {
          doc.fontSize(12).fillColor('red').text('UITGAVEN (UIT)');
          this.drawTable(doc, data.out);
          totalOut = data.out.reduce((sum, t) => sum + Math.abs(t.bedrag), 0);
          doc.moveDown(1);
        }

        const saldo = totalIn - totalOut;
        doc.fontSize(12).fillColor('black').font('Helvetica-Bold');
        doc.text(`Totaal IN: € ${totalIn.toFixed(2)}`, { continued: true });
        doc.text(` | Totaal UIT: € ${totalOut.toFixed(2)}`);

        doc.fillColor(saldo >= 0 ? 'green' : 'red');
        doc.text(`Saldo ${categoryName}: € ${saldo.toFixed(2)}`);

        doc.font('Helvetica');
        doc.moveDown(2);

        doc
          .strokeColor('#aaaaaa')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(2);
      });

      doc.end();
    });
  }

  // HELPER: SIMPELE TABEL TEKENEN
  private drawTable(doc: PDFKit.PDFDocument, transactions: any[]) {
    const startX = 50;
    let currentY = doc.y + 5;

    doc.fontSize(10).fillColor('black');

    doc.text('Datum', startX, currentY, { width: 70 });
    doc.text('Beschrijving', startX + 80, currentY, { width: 300 });
    doc.text('Bedrag', startX + 400, currentY, { width: 80, align: 'right' });

    currentY += 15;
    doc.moveTo(startX, currentY).lineTo(550, currentY).stroke();
    currentY += 5;

    transactions.forEach((t) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc.text(t.datum, startX, currentY, { width: 70 });
      const shortDesc =
        t.beschrijving.length > 60
          ? t.beschrijving.substring(0, 57) + '...'
          : t.beschrijving;
      doc.text(shortDesc, startX + 80, currentY, { width: 300 });

      const bedragStr = `€ ${Math.abs(t.bedrag).toFixed(2)}`;
      doc.text(bedragStr, startX + 400, currentY, {
        width: 80,
        align: 'right',
      });

      currentY += 15;
    });

    doc.y = currentY;
  }
}
