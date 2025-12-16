/* istanbul ignore file */
// src/services/cron.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import cron from 'node-cron';
import { eq, and, sql, inArray } from 'drizzle-orm';

import {
    type DatabaseProvider,
    InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { evenementen, aanwezigheden, users } from '../drizzle/schema';
import { MailService } from '../mail/mail.service';

const getDateString = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectDrizzle() private readonly db: DatabaseProvider,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    this.logger.log('⏳ CronService initialiseren...');
    cron.schedule('0 3 * * *', async () => {
      this.logger.log('⏰ Cron Job gestart: Nachtelijke checks...');
      await this.runDailyChecks();
    });
    this.logger.log('✅ Cronjobs ingepland (03:00 dagelijks)');
  }

  private async runDailyChecks() {
    try {
      await this.checkLuiwammes();
      await this.checkEscalatie();
      await this.checkTekortAanHandjes();
    } catch (err) {
      this.logger.error('🔥 Fatale fout in CronService run:', err);
    }
  }

  // ==========================================
  // CHECK 1: (luiwammes check) Na 7 dagen melding als er nog geen reden is gegeven.
  // ==========================================
  private async checkLuiwammes() {
    const targetDate = getDateString(7);
    this.logger.log(`🔍 Luiwammes check voor datum: ${targetDate}`);

    const results = await this.db
      .select({
        userName: users.voornaam,
        userEmail: users.email,
        eventName: evenementen.naam,
        aanwezigheidID: aanwezigheden.aanwezigheidID,
      })
      .from(aanwezigheden)
      .innerJoin(
        evenementen,
        eq(aanwezigheden.evenementID, evenementen.evenementID),
      )
      .innerJoin(users, eq(aanwezigheden.userID, users.userid))
      .where(
        and(
          eq(evenementen.datum, targetDate as unknown as Date),
          eq(aanwezigheden.status, 'UNKNOWN'),
          eq(aanwezigheden.reminder_sent, false),
        ),
      );

    this.logger.log(`📬 ${results.length} reminders te versturen.`);

    for (const row of results) {
      await this.mailService.sendNotification(
        row.userEmail,
        `Actie vereist: ${row.eventName}`,
        `Hey ${row.userName},\n\nJe hebt nog niet aangegeven of je erbij bent op <b>${row.eventName}</b> volgende week.\nVul dit aub zo snel mogelijk in!`,
      );

      await this.db
        .update(aanwezigheden)
        .set({ reminder_sent: true })
        .where(eq(aanwezigheden.aanwezigheidID, row.aanwezigheidID));
    }
  }

  // ==========================================
  // 2. CHECK 2 (checkEscalatie) 5 dagen niet gereageerd (naar hoofdleiding)
  // ==========================================
  private async checkEscalatie() {
    const targetDate = getDateString(5);
    const HOOFDLEIDING_EMAIL = 'hoofdleiding@kljsgw.be'; // TODO - deze bestaat maar later best naar allebei hun persoonlijke

    const results = await this.db
      .select({
        userName: users.voornaam,
        userLastname: users.familienaam,
        eventName: evenementen.naam,
      })
      .from(aanwezigheden)
      .innerJoin(
        evenementen,
        eq(aanwezigheden.evenementID, evenementen.evenementID),
      )
      .innerJoin(users, eq(aanwezigheden.userID, users.userid))
      .where(
        and(
          // 👇 FIX 2
          eq(evenementen.datum, targetDate as unknown as Date),
          eq(aanwezigheden.status, 'UNKNOWN'),
        ),
      );

    if (results.length > 0) {
      this.logger.warn(
        `⚠️ Escalatie: ${results.length} mensen hebben niet gereageerd.`,
      );

      const lijstje = results
        .map((r) => `• ${r.userName} ${r.userLastname} (voor ${r.eventName})`)
        .join('\n');

      await this.mailService.sendNotification(
        HOOFDLEIDING_EMAIL,
        'Escalatie: Ontbrekende aanwezigheden',
        `Beste Hoofdleiding,\n\nDe volgende leiding heeft nog steeds niet gereageerd:\n\n${lijstje}`,
      );
    }
  }

  // ==========================================
  // CHECK 3: TEKORT HANDJES CHECK -> als er minder als 3 mensen kunnen voor een activiteit, stuur een mail
  // ==========================================
  private async checkTekortAanHandjes() {
    const targetDate = getDateString(7);
    const GROEPS_VERANTWOORDELIJKE = 'hoofdleiding@kljsgw.be'; //TODO afhankelijk van leeftijdsgroep aanpassen

    const activities = await this.db
      .select()
      .from(evenementen)
      .where(
        and(
          // 👇 FIX 3
          eq(evenementen.datum, targetDate as unknown as Date),
          eq(evenementen.type, 'ACTIVITEIT'),
        ),
      );

    for (const act of activities) {
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(aanwezigheden)
        .where(
          and(
            eq(aanwezigheden.evenementID, act.evenementID),
            inArray(aanwezigheden.status, ['PRESENT', 'PARTIAL']),
          ),
        );

      const count = result[0].count;

      if (count < 3) {
        this.logger.warn(
          `⚠️ Tekort aan leiding voor ${act.naam}: slechts ${count}`,
        );

        await this.mailService.sendNotification(
          GROEPS_VERANTWOORDELIJKE,
          `Tekort leiding: ${act.naam}`,
          `Opgelet,\n\nVoor de activiteit <b>${act.naam}</b> zijn er momenteel maar <b>${count}</b> leiding aanwezig.`,
        );
      }
    }
  }
}
