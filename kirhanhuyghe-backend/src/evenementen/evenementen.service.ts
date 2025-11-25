import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class EvenementenService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
    private readonly mailService: MailService,
  ) {}

  // Alle evenementen ophalen
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

  // Evenement op ID ophalen
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

    //  AUTOMATISCH AANWEZIGHEDEN AANMAKEN

    const allUsers = await this.db.select().from(users);

    if (allUsers.length > 0) {
      const emptyAttendances = allUsers.map((user) => ({
        evenementID: newEventId,
        userID: user.userid,
        status: 'UNKNOWN' as const, // Default status
        reminder_sent: false,
      }));

      await this.db.insert(aanwezigheden).values(emptyAttendances);
    }

    return await this.getById(newEventId);
  }

  // UPDATE
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

  // DELETE
  async deleteById(id: number): Promise<void> {
    // Eerst afhankelijke records verwijderen (aanwezigheden)
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

  // ---------------------------------------------------------
  // PDF RAPPORTAGE
  // ---------------------------------------------------------

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
        telnr: leidingProfiel.telnr,
      })
      .from(aanwezigheden)
      .innerJoin(users, eq(aanwezigheden.userID, users.userid))
      .leftJoin(leidingProfiel, eq(users.userid, leidingProfiel.userID))
      .where(eq(aanwezigheden.evenementID, evenementID));

    if (rawAanwezigheden.length === 0) {
      console.warn('Geen aanwezigheden gevonden, PDF zal leeg zijn.');
    }

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
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.on('error', (err: any) => {
        if (err instanceof Error) {
          reject(err);
        } else {
          reject(new Error(String(err)));
        }
      });

      doc.fontSize(20).text(`Aanwezigheidslijst`, { align: 'center' });
      doc
        .fontSize(14)
        .text(`${eventInfo.naam} (${eventInfo.type})`, { align: 'center' });
      doc
        .fontSize(10)
        .text(
          `Datum: ${eventInfo.datum} | Tijd: ${eventInfo.startuur} - ${eventInfo.einduur}`,
          { align: 'center' },
        );
      doc.moveDown(2);

      const presentCount = attendees.filter(
        (a) => a.status === 'PRESENT',
      ).length;
      const absentCount = attendees.filter((a) => a.status === 'ABSENT').length;
      const partialCount = attendees.filter(
        (a) => a.status === 'PARTIAL',
      ).length;

      doc
        .fontSize(12)
        .text(
          `Aanwezig: ${presentCount} | Afwezig: ${absentCount} | Deels: ${partialCount}`,
        );
      doc.moveDown(1);

      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(1);

      this.drawAttendanceTable(doc, attendees);

      doc.end();
    });
  }

  private drawAttendanceTable(doc: PDFKit.PDFDocument, attendees: any[]) {
    const startX = 50;
    let currentY = doc.y + 5;

    doc.fontSize(10).fillColor('black').font('Helvetica-Bold');

    doc.text('Naam', startX, currentY, { width: 150 });
    doc.text('Status', startX + 160, currentY, { width: 80 });
    doc.text('Info / Reden', startX + 250, currentY, { width: 200 });
    doc.text('Tel', startX + 460, currentY, { width: 80 });

    currentY += 15;
    doc.moveTo(startX, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    doc.font('Helvetica');

    attendees.forEach((p) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const fullName = `${p.voornaam} ${p.familienaam}`;
      let statusColor = 'black';
      if (p.status === 'PRESENT') statusColor = 'green';
      if (p.status === 'ABSENT') statusColor = 'red';
      if (p.status === 'PARTIAL') statusColor = 'orange';

      doc.fillColor('black').text(fullName, startX, currentY, { width: 150 });

      doc
        .fillColor(statusColor)
        .text(p.status, startX + 160, currentY, { width: 80 });

      const redenText = p.reden ? p.reden : '-';
      doc.fillColor('black').text(redenText, startX + 250, currentY, {
        width: 200,
        height: 15,
        ellipsis: true,
      });

      const tel = p.telnr ? p.telnr : '';
      doc.text(tel, startX + 460, currentY, { width: 80 });

      currentY += 20;
    });

    doc.y = currentY;
  }
}
