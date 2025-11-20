import { Injectable, Logger } from '@nestjs/common'; // 👈 Import Logger
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name); // 👈 Logger aanmaken

  constructor(private mailerService: MailerService) {}

  async sendAccountRequest(firstName: string, lastName: string, email: string) {
    const adminEmail = 'kasboek@kljsgw.be';

    this.logger.log(
      `📧 Poging tot mailen... Van: OAuth User -> Naar: ${adminEmail}`,
    );

    try {
      // 1. Mail naar Admin
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `Nieuwe accountaanvraag: ${firstName} ${lastName}`,
        html: `
          <h3>Nieuwe accountaanvraag</h3>
          <p><strong>Naam:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
        `,
      });
      this.logger.log(`✅ Mail naar admin (${adminEmail}) verzonden!`);

      // 2. Bevestiging naar Gebruiker
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bevestiging aanvraag KLJ Kasboek',
        html: `<p>Beste ${firstName}, we hebben je aanvraag ontvangen.</p>`,
      });
      this.logger.log(`✅ Bevestiging naar gebruiker (${email}) verzonden!`);
    } catch (error) {
      // 👇 DIT IS CRUCIAAL: Print de echte error
      this.logger.error('❌ FOUT BIJ VERZENDEN MAIL:', error);
      throw error; // Gooi de fout door zodat de frontend een 500 krijgt
    }
  }
  async sendTransactionReport(
    userEmail: string,
    firstName: string,
    pdfBuffer: Buffer,
  ) {
    this.logger.log(`📧 Rapport versturen naar ${userEmail}...`);

    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Jouw Transactie Rapport - KLJ Kasboek',
        html: `
          <h3>Dag ${firstName},</h3>
          <p>In bijlage vind je het gevraagde overzicht van je transacties, opgesplitst per categorie.</p>
          <p>Met vriendelijke groeten,<br/>Het KLJ Kasboek Team</p>
        `,
        attachments: [
          {
            filename: `Rapport-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      this.logger.log(`✅ Rapport verzonden naar ${userEmail}`);
    } catch (error) {
      this.logger.error('❌ Fout bij versturen rapport:', error);
      throw error;
    }
  }
}
