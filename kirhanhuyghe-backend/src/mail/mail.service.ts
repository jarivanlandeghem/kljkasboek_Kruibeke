import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendAccountRequest(firstName: string, lastName: string, email: string) {
    const adminEmail = 'kasboek@kljsgw.be';
    this.logger.log(
      `[1/3] Start sendAccountRequest. Van: OAuthUser -> Naar Admin: ${adminEmail} en User: ${email}`,
    );

    try {
      this.logger.log(`[2/3] Versturen mail naar Admin (${adminEmail})...`);
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `Nieuwe accountaanvraag: ${firstName} ${lastName}`,
        html: `
          <h3>Nieuwe accountaanvraag</h3>
          <p><strong>Naam:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
        `,
      });
      this.logger.log(`[CHECK] Mail naar Admin verzonden.`);

      this.logger.log(`[2/3] Versturen bevestiging naar User (${email})...`);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bevestiging aanvraag KLJ Portaal',
        html: `<p>Beste ${firstName}, we hebben je aanvraag ontvangen.</p>`,
      });

      this.logger.log(
        `[3/3] ✅ sendAccountRequest volledig succesvol afgerond.`,
      );
    } catch (error) {
      this.logger.error(
        `[ERROR] Fout in sendAccountRequest: ${error instanceof Error ? error.message : error}`,
        error,
      );
      throw error;
    }
  }

  async sendTransactionReport(
    userEmail: string,
    firstName: string,
    pdfBuffer: Buffer,
  ) {
    this.logger.log(
      `[1/3] Start sendTransactionReport naar ${userEmail}. PDF grootte: ${pdfBuffer.length} bytes`,
    );

    try {
      this.logger.log(`[2/3] Verbinding maken met SMTP server...`);
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Jouw Rapport - KLJ Portaal',
        html: `
          <h3>Dag ${firstName},</h3>
          <p>In bijlage vind je het opgevraagde rapport.</p>
          <p>Met vriendelijke groeten,<br/>Het KLJ Portaal Team</p>
        `,
        attachments: [
          {
            filename: `Rapport-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      this.logger.log(
        `[3/3] ✅ Rapport succesvol afgeleverd bij mailserver voor ${userEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `[ERROR] Fout in sendTransactionReport: ${error instanceof Error ? error.message : error}`,
        error,
      );
      throw error;
    }
  }

  async sendNotification(to: string, subject: string, message: string) {
    this.logger.log(
      `[1/3] Start sendNotification naar ${to}. Onderwerp: ${subject}`,
    );

    try {
      this.logger.log(`[2/3] Versturen notificatie...`);
      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        html: `
          <h3>KLJ Systeem Melding</h3>
          <p>${message.replace(/\n/g, '<br>')}</p> 
          <br/>
          <small>Dit is een geautomatiseerd bericht.</small>
        `,
      });
      this.logger.log(`[3/3] ✅ Notificatie verzonden naar ${to}`);
    } catch (error) {
      this.logger.error(
        `[ERROR] Fout in sendNotification naar ${to}: ${error instanceof Error ? error.message : error}`,
        error,
      );
    }
  }
}
