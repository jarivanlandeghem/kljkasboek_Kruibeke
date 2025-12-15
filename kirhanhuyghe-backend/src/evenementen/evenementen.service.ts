import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  CreateEvenementRequestDto,
  EvenementListResponseDto,
  EvenementResponseDto,
  UpdateEvenementDto,
} from './evenementen.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import {
  evenementen,
  aanwezigheden,
  users,
  leidingProfiel,
} from '../drizzle/schema';
import { MailService } from '../mail/mail.service';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

const STATUS_TRANSLATIONS: Record<string, string> = {
  PRESENT: 'Aanwezig',
  ABSENT: 'Afwezig',
  PARTIAL: 'Aangepast',
  UNKNOWN: 'Onbekend',
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: '#2e7d32',
  ABSENT: '#c62828',
  PARTIAL: '#ef6c00',
  UNKNOWN: '#757575',
};

@Injectable()
export class EvenementenService {
  private readonly logger = new Logger(EvenementenService.name);

  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
    private readonly mailService: MailService,
  ) {}

  async getAll(): Promise<EvenementListResponseDto> {
    const items = await this.db.query.evenementen.findMany({
      orderBy: (evenementen, { desc }) => [desc(evenementen.datum)],
    });

    const responseItems: EvenementResponseDto[] = items.map((e) => ({
      evenementID: e.evenementID,
      type: e.type,
      naam: e.naam,
      beschrijving: e.beschrijving,
      datum: String(e.datum),
      startuur: String(e.startuur),
      einduur: String(e.einduur),
    }));

    return { items: responseItems };
  }

  async getById(id: number): Promise<EvenementResponseDto> {
    const evenement = await this.db.query.evenementen.findFirst({
      where: eq(evenementen.evenementID, id),
    });

    if (!evenement) {
      throw new NotFoundException('Er bestaat geen evenement met deze ID');
    }

    return this.toResponseDto(evenement);
  }

  async create(dto: CreateEvenementRequestDto): Promise<EvenementResponseDto> {
    const evenementToInsert = {
      ...dto,
      datum: new Date(dto.datum),
    };

    const [newEvenementIdObject] = await this.db
      .insert(evenementen)
      .values(evenementToInsert)
      .$returningId();

    const newEventId = newEvenementIdObject.evenementID;

    const allUsers = await this.db.select().from(users);

    if (allUsers.length > 0) {
      const emptyAttendances = allUsers.map((user) => ({
        evenementID: newEventId,
        userID: user.userid,
        status: 'UNKNOWN' as const,
        reminder_sent: false,
      }));

      await this.db.insert(aanwezigheden).values(emptyAttendances);
    }

    return await this.getById(newEventId);
  }

  async updateById(
    id: number,
    updateDto: UpdateEvenementDto,
  ): Promise<EvenementResponseDto | undefined> {
    let existingEvenement: EvenementResponseDto;
    try {
      existingEvenement = await this.getById(id);
    } catch {
      return undefined;
    }

    const dataToUpdate: any = { ...updateDto };

    if (updateDto.datum) {
      dataToUpdate.datum = new Date(updateDto.datum);
    }

    await this.db
      .update(evenementen)
      .set(dataToUpdate)
      .where(eq(evenementen.evenementID, id));

    return { ...existingEvenement, ...updateDto };
  }

  async deleteById(id: number): Promise<void> {
    await this.db
      .delete(aanwezigheden)
      .where(eq(aanwezigheden.evenementID, id));

    const [result] = await this.db
      .delete(evenementen)
      .where(eq(evenementen.evenementID, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen evenement met deze ID');
    }
  }

  private toResponseDto(data: any): EvenementResponseDto {
    return {
      evenementID: data.evenementID,
      type: data.type,
      naam: data.naam,
      beschrijving: data.beschrijving,
      datum: String(data.datum),
      startuur: String(data.startuur),
      einduur: String(data.einduur),
    };
  }

  async generateAndMailAttendanceList(
    evenementID: number,
    userEmail: string,
    receiverName: string,
  ): Promise<void> {
    const evenementInfo = await this.getById(evenementID);

    const rawAanwezigheden = await this.db
      .select({
        voornaam: users.voornaam,
        familienaam: users.familienaam,
        status: aanwezigheden.status,
        reden: aanwezigheden.reden,
        aangepast_startuur: aanwezigheden.aangepast_startuur,
        aangepast_einduur: aanwezigheden.aangepast_einduur,
      })
      .from(aanwezigheden)
      .innerJoin(users, eq(aanwezigheden.userID, users.userid))
      .leftJoin(leidingProfiel, eq(users.userid, leidingProfiel.userID))
      .where(eq(aanwezigheden.evenementID, evenementID));

    const pdfBuffer = await this.createPdfBuffer(
      evenementInfo,
      rawAanwezigheden,
    );

    await this.mailService.sendTransactionReport(
      userEmail,
      receiverName,
      pdfBuffer,
    );
  }

  private createPdfBuffer(
    eventInfo: EvenementResponseDto,
    attendees: any[],
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
        Medium: path.join(assetsPath, 'Poppins-Medium.ttf'),
        Light: path.join(assetsPath, 'Poppins-Light.ttf'),
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
      const fMedium = registerFont(
        'Poppins-Medium',
        fontPaths.Medium,
        'Helvetica',
      );
      const fLight = registerFont(
        'Poppins-Light',
        fontPaths.Light,
        'Helvetica',
      );

      doc.font(fRegular);

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }

      doc.font(fBold).fontSize(22).fillColor('#222222');
      doc.text('Aanwezigheidslijst', 120, 40);

      doc.font(fMedium).fontSize(10).fillColor('#666666');
      doc.text(`${eventInfo.naam} (${eventInfo.type})`, 120, 68);
      doc.text(
        `${new Date(eventInfo.datum).toLocaleDateString('nl-BE')} • ${eventInfo.startuur.slice(0, 5)} - ${eventInfo.einduur.slice(0, 5)}`,
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

      const presentCount = attendees.filter(
        (a) => a.status === 'PRESENT',
      ).length;
      const absentCount = attendees.filter((a) => a.status === 'ABSENT').length;
      const partialCount = attendees.filter(
        (a) => a.status === 'PARTIAL',
      ).length;

      doc.font(fSemiBold).fontSize(12).fillColor('black');
      doc.text(
        `Aanwezig: ${presentCount}   |   Afwezig: ${absentCount}   |   Aangepast: ${partialCount}`,
        40,
        doc.y,
      );
      doc.moveDown(1);

      this.drawAttendanceTable(doc, attendees, {
        regular: fRegular,
        semiBold: fSemiBold,
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

  private drawAttendanceTable(
    doc: PDFKit.PDFDocument,
    attendees: any[],
    fonts: { regular: string; semiBold: string },
  ) {
    const startX = 40;
    const colNaam = startX + 10;
    const colStatus = startX + 160;
    const colInfo = startX + 260;

    const rowHeight = 24;

    let currentY = doc.y + 10;

    doc.rect(startX, currentY, 515, rowHeight).fill('#eeeeee');
    doc.fillColor('#333333').font(fonts.semiBold).fontSize(9);

    doc.text('NAAM', colNaam, currentY + 7);
    doc.text('STATUS', colStatus, currentY + 7);
    doc.text('REDEN / INFO', colInfo, currentY + 7);

    currentY += rowHeight;
    doc.font(fonts.regular);

    attendees.forEach((p, index) => {
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;
      }

      if (index % 2 === 0) {
        doc.rect(startX, currentY, 515, rowHeight).fill('#f9f9f9');
      }

      doc.fillColor('#444444').fontSize(9);

      doc.text(`${p.voornaam} ${p.familienaam}`, colNaam, currentY + 7);

      const statusKey = String(p.status);
      const statusLabel = STATUS_TRANSLATIONS[statusKey] || statusKey;
      const statusColor = STATUS_COLORS[statusKey] || 'black';

      doc.save();
      doc.fillColor(statusColor).font(fonts.semiBold);
      doc.text(statusLabel, colStatus, currentY + 7);
      doc.restore();

      const infoParts: string[] = [];

      if (p.reden) {
        infoParts.push(p.reden.replace(/\n/g, ' '));
      }

      if (p.status === 'PARTIAL') {
        const start = p.aangepast_startuur
          ? String(p.aangepast_startuur).slice(0, 5)
          : null;
        const end = p.aangepast_einduur
          ? String(p.aangepast_einduur).slice(0, 5)
          : null;

        if (start || end) {
          const timeStr = `${start || '?'} - ${end || '?'}`;
          infoParts.push(`(${timeStr})`);
        }
      }

      const finalText = infoParts.length > 0 ? infoParts.join(' ') : '-';

      doc.text(finalText, colInfo, currentY + 7, {
        width: 250,
        ellipsis: true,
      });

      currentY += rowHeight;
    });

    doc.y = currentY;
  }
}
