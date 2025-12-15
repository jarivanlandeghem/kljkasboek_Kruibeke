import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq, sql, and, like, desc, asc } from 'drizzle-orm';
import {
  CreateTransactieRequestDto,
  GetTransactiesDto,
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

  async getAll(query: GetTransactiesDto): Promise<TransactieListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const offset = (page - 1) * limit;

    const whereClause = search
      ? and(like(transacties.beschrijving, `%${search}%`))
      : undefined;

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(transacties)
      .where(whereClause);

    const total = Number(countResult.count);

    const sortField = query.sort || 'datum';
    const direction = query.direction || 'desc';
    const dirFunc = direction === 'asc' ? asc : desc;

    let orderByClause: any = dirFunc(transacties.datum);
    switch (sortField) {
      case 'bedrag':
        orderByClause = dirFunc(transacties.bedrag);
        break;
      case 'beschrijving':
        orderByClause = dirFunc(transacties.beschrijving);
        break;
      default:
        orderByClause = dirFunc(transacties.datum);
    }

    const items = await this.db.query.transacties.findMany({
      where: search ? like(transacties.beschrijving, `%${search}%`) : undefined,
      limit: limit,
      offset: offset,
      orderBy: [orderByClause],
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

    if (userIds.length > 0) {
      const dbUsers = await this.db
        .select()
        .from(users)
        .where(sql`${users.userid} IN ${userIds}`);

      dbUsers.forEach((u) => {
        userMap.set(u.userid, {
          voornaam: u.voornaam,
          familienaam: u.familienaam,
        });
      });
    }
    const responseItems: TransactieResponseDto[] = itemsWithDetails.map(
      (it) => ({
        transactieID: it.transactieID,
        userID: it.userID,
        beschrijving: it.beschrijving,
        in_uit: it.in_uit,
        bedrag: Number(it.bedrag),
        datum: String(it.datum),
        author: userMap.get(it.userID) || undefined,
        categorieDetails: it.categorieDetails,
      }),
    );

    return {
      items: responseItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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

      const assetsPath = path.join(__dirname, '..', '..', 'assets');

      const fontPaths = {
        Regular: path.join(assetsPath, 'Poppins-Regular.ttf'),
        Bold: path.join(assetsPath, 'Poppins-Bold.ttf'),
        SemiBold: path.join(assetsPath, 'Poppins-SemiBold.ttf'),
        Light: path.join(assetsPath, 'Poppins-Light.ttf'),
        Medium: path.join(assetsPath, 'Poppins-Medium.ttf'),
      };

      const logoPath = path.join(assetsPath, 'KLJ_LOGO_MANNETJE.png');

      const registerFont = (name: string, p: string, fallback: string) => {
        if (fs.existsSync(p)) {
          doc.registerFont(name, p);
          return name;
        }
        return fallback;
      };

      const fRegular = registerFont('Poppins', fontPaths.Regular, 'Helvetica');
      const fBold = registerFont(
        'Poppins-Bold',
        fontPaths.Bold,
        'Helvetica-Bold',
      );
      const fSemiBold = registerFont(
        'Poppins-SemiBold',
        fontPaths.SemiBold,
        'Helvetica-Bold',
      );
      const fLight = registerFont(
        'Poppins-Light',
        fontPaths.Light,
        'Helvetica',
      );
      const fMedium = registerFont(
        'Poppins-Medium',
        fontPaths.Medium,
        'Helvetica',
      );

      doc.font(fRegular);

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => {
        reject(err instanceof Error ? err : new Error(String(err)));
      });

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }

      doc.font(fBold).fontSize(22).fillColor('#222222');
      doc.text('Transactie Rapport', 120, 40);

      doc.font(fMedium).fontSize(10).fillColor('#666666');
      doc.text(`Lid: ${name}`, 120, 68);
      doc.text(
        `Aangemaakt op: ${new Date().toLocaleDateString('nl-BE')}`,
        120,
        82,
      );

      doc
        .moveTo(40, 110)
        .lineTo(550, 110)
        .lineWidth(2)
        .strokeColor('#E30613')
        .stroke();

      doc.moveDown(3);
      doc.y = 130;

      groupedData.forEach((data, categoryName) => {
        if (doc.y > 650) doc.addPage();

        doc.font(fSemiBold).fontSize(14).fillColor('#222222');
        doc.text(categoryName.toUpperCase());
        doc.moveDown(0.5);

        let totalIn = 0;
        let totalOut = 0;

        const tableFonts = { regular: fRegular, semiBold: fSemiBold };

        if (data.in.length > 0) {
          doc
            .font(fMedium)
            .fontSize(10)
            .fillColor('#2e7d32')
            .text('INKOMSTEN', { indent: 2 });
          doc.moveDown(0.2);
          this.drawTable(doc, data.in, '#e8f5e9', tableFonts);
          totalIn = data.in.reduce((sum, t) => sum + t.bedrag, 0);
          doc.moveDown(1);
        }

        if (data.out.length > 0) {
          doc
            .font(fMedium)
            .fontSize(10)
            .fillColor('#c62828')
            .text('UITGAVEN', { indent: 2 });
          doc.moveDown(0.2);
          this.drawTable(doc, data.out, '#ffebee', tableFonts);
          totalOut = data.out.reduce((sum, t) => sum + Math.abs(t.bedrag), 0);
          doc.moveDown(1);
        }

        const saldo = totalIn - totalOut;
        const startX = 320;

        doc.font(fRegular).fontSize(10).fillColor('black');

        doc.text(`Totaal In:`, startX, doc.y, { continued: true });
        doc.text(`€ ${totalIn.toFixed(2)}`, { align: 'right' });

        doc.text(`Totaal Uit:`, startX, doc.y, { continued: true });
        doc.text(`€ ${totalOut.toFixed(2)}`, { align: 'right' });

        doc.moveDown(0.3);

        doc.font(fBold);
        doc.fillColor(saldo >= 0 ? '#2e7d32' : '#c62828');
        doc.text(`Saldo ${categoryName}:`, startX, doc.y, { continued: true });
        doc.text(`€ ${saldo.toFixed(2)}`, { align: 'right' });

        doc.font(fRegular);
        doc.moveDown(1.5);

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

      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.font(fLight).fontSize(8).fillColor('#999999');
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

  private drawTable(
    doc: PDFKit.PDFDocument,
    transactions: any[],
    headerBgColor: string,
    fonts: { regular: string; semiBold: string },
  ) {
    const startX = 40;
    const colDatum = startX + 5;
    const colBeschr = startX + 90;
    const colBedrag = startX + 400;
    const rowHeight = 20;

    let currentY = doc.y;

    doc.rect(startX, currentY, 510, rowHeight).fill(headerBgColor);
    doc.fillColor('#333333').font(fonts.semiBold).fontSize(9);

    doc.text('DATUM', colDatum, currentY + 6);
    doc.text('BESCHRIJVING', colBeschr, currentY + 6);
    doc.text('BEDRAG', colBedrag, currentY + 6, {
      width: 100,
      align: 'right',
    });

    currentY += rowHeight;
    doc.font(fonts.regular);

    transactions.forEach((t, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

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

    doc.y = currentY;
  }
}
