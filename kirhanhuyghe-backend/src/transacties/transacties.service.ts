// src/transactie/transactie.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TransactieService {
  private readonly logger = new Logger(TransactieService.name);

  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
    private readonly mailService: MailService,
  ) {}

  // ==========================================================================================
  //  CRUD OPERATIES (Deze blijven ongewijzigd, maar zijn nodig voor de context)
  // ==========================================================================================

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
      return { ...t, categorieDetails };
    });

    const userIds = Array.from(
      new Set(itemsWithDetails.map((it) => it.userID).filter(Boolean)),
    );
    const userMap = new Map<
      number,
      { voornaam: string; familienaam: string }
    >();

    for (const id of userIds) {
      const [dbUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.userid, id))
        .limit(1);
      if (dbUser)
        userMap.set(id, {
          voornaam: dbUser.voornaam,
          familienaam: dbUser.familienaam,
        });
    }

    return {
      items: itemsWithDetails.map((it) => ({
        ...it,
        author: userMap.get(it.userID) || null,
      })),
    };
  }

  async getById(id: number): Promise<TransactieResponseDto> {
    const transactie = await this.db.query.transacties.findFirst({
      where: eq(transacties.transactieID, id),
      with: { categorieKoppelingen: true },
    });
    if (!transactie)
      throw new NotFoundException('Er bestaat geen transactie met deze ID');

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

  async create(
    transactie: CreateTransactieRequestDto,
  ): Promise<TransactieResponseDto> {
    const [newIdObj] = await this.db
      .insert(transacties)
      .values(transactie)
      .$returningId();
    return this.getById(newIdObj.transactieID);
  }

  async updateById(
    id: number,
    updateDto: UpdateTransactieDto,
  ): Promise<TransactieResponseDto | undefined> {
    await this.db
      .update(transacties)
      .set(updateDto)
      .where(eq(transacties.transactieID, id));
    if (updateDto.categorieIDs)
      await this.updateCategorieKoppelingen(id, updateDto.categorieIDs);
    return this.getById(id);
  }

  async updateCategorieKoppelingen(id: number, categorieIDs: number[]) {
    await this.db
      .delete(transactieCategorie)
      .where(eq(transactieCategorie.transactieID, id));
    if (categorieIDs.length) {
      await this.db
        .insert(transactieCategorie)
        .values(
          categorieIDs.map((cid) => ({ transactieID: id, categorieID: cid })),
        );
    }
  }

  async deleteById(id: number): Promise<void> {
    const [res] = await this.db
      .delete(transacties)
      .where(eq(transacties.transactieID, id));
    if (res.affectedRows === 0) throw new NotFoundException('Niet gevonden');
  }

  private toResponseDto(transactie: Transactie): TransactieResponseDto {
    return {
      ...transactie,
      bedrag: Number(transactie.bedrag),
      datum: String(transactie.datum),
    };
  }

  // ==========================================================================================
  //  PDF RAPPORTAGE LOGICA (AANGEPAST)
  // ==========================================================================================

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

    if (rawData.length === 0)
      throw new NotFoundException('Geen transacties gevonden.');

    const grouped = new Map<string, { in: any[]; out: any[] }>();

    rawData.forEach((row) => {
      const catName = row.categorieNaam || 'Overige';
      if (!grouped.has(catName)) grouped.set(catName, { in: [], out: [] });
      const group = grouped.get(catName);

      const bedrag = Number(row.bedrag);
      if (row.in_uit === 'IN') group?.in.push({ ...row, bedrag });
      else group?.out.push({ ...row, bedrag });
    });

    const pdfBuffer = await this.createPdfBuffer(grouped, firstName);
    await this.mailService.sendTransactionReport(
      userEmail,
      firstName,
      pdfBuffer,
    );
  }

  /**
   * Genereert de PDF met Poppins fonts en KLJ Mannetje logo
   */
  private createPdfBuffer(
    groupedData: Map<string, { in: any[]; out: any[] }>,
    name: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        bufferPages: true,
      });
      const buffers: Buffer[] = [];

      // 1. PADEN INSTELLEN
      // process.cwd() verwijst naar de root map waar je package.json staat
      const assetsPath = path.join(process.cwd(), 'assets');

      // Specifieke bestandsnamen zoals je ze hebt aangeleverd
      const fonts = {
        Regular: path.join(assetsPath, 'Poppins-Regular.ttf'),
        Bold: path.join(assetsPath, 'Poppins-Bold.ttf'),
        SemiBold: path.join(assetsPath, 'Poppins-SemiBold.ttf'),
        Light: path.join(assetsPath, 'Poppins-Light.ttf'),
        Italic: path.join(assetsPath, 'Poppins-Italic.ttf'),
        Medium: path.join(assetsPath, 'Poppins-Medium.ttf'),
      };

      const logoPath = path.join(assetsPath, 'KLJ_LOGO_MANNETJE.png');

      // 2. FONTS REGISTREREN
      // We proberen ze te laden. Als ze niet bestaan, vallen we niet keihard om maar loggen we een warning.
      try {
        if (fs.existsSync(fonts.Regular))
          doc.registerFont('Poppins', fonts.Regular);
        if (fs.existsSync(fonts.Bold))
          doc.registerFont('Poppins-Bold', fonts.Bold);
        if (fs.existsSync(fonts.SemiBold))
          doc.registerFont('Poppins-SemiBold', fonts.SemiBold);
        if (fs.existsSync(fonts.Light))
          doc.registerFont('Poppins-Light', fonts.Light);
        if (fs.existsSync(fonts.Medium))
          doc.registerFont('Poppins-Medium', fonts.Medium);

        // Zet standaard font
        doc.font('Poppins');
      } catch (e) {
        this.logger.warn(
          'Kon Poppins fonts niet laden, fallback naar Helvetica. Check je assets map.',
        );
        doc.font('Helvetica');
      }

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // --- HEADER ---

      // Logo (KLJ Mannetje)
      if (fs.existsSync(logoPath)) {
        // Logo linksboven, iets groter omdat het een mannetje is
        doc.image(logoPath, 40, 30, { width: 60 });
      }

      // Titel en Info (Rechts van logo of gecentreerd)
      // We gebruiken Poppins-Bold voor de titel
      doc.font('Poppins-Bold').fontSize(22).fillColor('#222222');
      doc.text('Transactie Rapport', 120, 40);

      doc.font('Poppins-Medium').fontSize(10).fillColor('#666666');
      doc.text(`Lid: ${name}`, 120, 68);
      doc.text(
        `Aangemaakt op: ${new Date().toLocaleDateString('nl-BE')}`,
        120,
        82,
      );

      // Rode lijn onder header (KLJ Rood stijl)
      doc
        .moveTo(40, 110)
        .lineTo(550, 110)
        .lineWidth(2)
        .strokeColor('#E30613')
        .stroke();

      doc.moveDown(3);
      doc.y = 130; // Start y-positie voor content

      // --- CONTENT ---

      groupedData.forEach((data, categoryName) => {
        // Check of we ruimte hebben op de pagina
        if (doc.y > 650) doc.addPage();

        // Categorie Header
        doc.font('Poppins-SemiBold').fontSize(14).fillColor('#222222');
        doc.text(categoryName.toUpperCase());
        doc.moveDown(0.5);

        let totalIn = 0;
        let totalOut = 0;

        // Tabel Inkomsten
        if (data.in.length > 0) {
          doc
            .font('Poppins-Medium')
            .fontSize(10)
            .fillColor('#2e7d32')
            .text('INKOMSTEN', { indent: 2 });
          doc.moveDown(0.2);
          this.drawTable(doc, data.in, '#e8f5e9'); // Groene header achtergrond
          totalIn = data.in.reduce((sum, t) => sum + t.bedrag, 0);
          doc.moveDown(1);
        }

        // Tabel Uitgaven
        if (data.out.length > 0) {
          doc
            .font('Poppins-Medium')
            .fontSize(10)
            .fillColor('#c62828')
            .text('UITGAVEN', { indent: 2 });
          doc.moveDown(0.2);
          this.drawTable(doc, data.out, '#ffebee'); // Rode header achtergrond
          totalOut = data.out.reduce((sum, t) => sum + Math.abs(t.bedrag), 0);
          doc.moveDown(1);
        }

        // Totaal blokje per categorie
        const saldo = totalIn - totalOut;
        const startX = 320;

        doc.font('Poppins-Regular').fontSize(10).fillColor('black');

        // Totalen uitlijning
        doc.text(`Totaal In:`, startX, doc.y, { continued: true });
        doc.text(`€ ${totalIn.toFixed(2)}`, { align: 'right' });

        doc.text(`Totaal Uit:`, startX, doc.y, { continued: true });
        doc.text(`€ ${totalOut.toFixed(2)}`, { align: 'right' });

        doc.moveDown(0.3);

        // Saldo dikgedrukt
        doc.font('Poppins-Bold');
        doc.fillColor(saldo >= 0 ? '#2e7d32' : '#c62828'); // Groen of Rood
        doc.text(`Saldo ${categoryName}:`, startX, doc.y, { continued: true });
        doc.text(`€ ${saldo.toFixed(2)}`, { align: 'right' });

        // Reset
        doc.font('Poppins-Regular');
        doc.moveDown(1.5);

        // Stippellijn scheiding
        doc
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .lineWidth(0.5)
          .strokeColor('#cccccc')
          .dash(3, { space: 3 })
          .stroke()
          .undash();

        doc.moveDown(2);
      });

      // --- FOOTER (Paginanummers) ---
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.font('Poppins-Light').fontSize(8).fillColor('#999999');
        doc.text(
          `Pagina ${i + 1} van ${range.count} - Gegenereerd door KLJ Portaal`,
          40,
          doc.page.height - 30,
          { align: 'center', width: 515 },
        );
      }

      doc.end();
    });
  }

  // Helper om mooie tabellen te tekenen
  private drawTable(
    doc: PDFKit.PDFDocument,
    transactions: any[],
    headerBgColor: string,
  ) {
    const startX = 40;
    const colDatum = startX + 5;
    const colBeschr = startX + 90;
    const colBedrag = startX + 400;
    const rowHeight = 20;

    let currentY = doc.y;

    // Header Balk
    doc.rect(startX, currentY, 510, rowHeight).fill(headerBgColor);
    doc.fillColor('#333333').font('Poppins-SemiBold').fontSize(9);

    // Header Tekst (Iets verlaagd voor verticale centrering)
    doc.text('DATUM', colDatum, currentY + 6);
    doc.text('BESCHRIJVING', colBeschr, currentY + 6);
    doc.text('BEDRAG', colBedrag, currentY + 6, { width: 100, align: 'right' });

    currentY += rowHeight;
    doc.font('Poppins'); // Terug naar regular

    // Rijen
    transactions.forEach((t, index) => {
      // Nieuwe pagina check
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Zebra striping (om en om lichtgrijs)
      if (index % 2 === 0) {
        doc.rect(startX, currentY, 510, rowHeight).fill('#f9f9f9');
      }

      doc.fillColor('#444444').fontSize(9);

      const datumStr = new Date(t.datum).toLocaleDateString('nl-BE');
      doc.text(datumStr, colDatum, currentY + 6);

      const desc =
        t.beschrijving.length > 60
          ? t.beschrijving.substr(0, 57) + '...'
          : t.beschrijving;
      doc.text(desc, colBeschr, currentY + 6);

      const bedragStr = `€ ${Math.abs(t.bedrag).toFixed(2)}`;
      doc.text(bedragStr, colBedrag, currentY + 6, {
        width: 100,
        align: 'right',
      });

      currentY += rowHeight;
    });

    // Cursor update na tabel
    doc.y = currentY;
  }
}
