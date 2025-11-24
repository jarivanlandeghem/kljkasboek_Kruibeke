// src/drizzle/schema.ts
import {
  mysqlTable,
  int,
  decimal,
  date,
  time,
  boolean,
  text,
  mysqlEnum,
  primaryKey,
  varchar,
  uniqueIndex,
  json,
  index,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------
// KASBOEK & USERS CODE
// ---------------------------------------------------------

// Transacties
export const transacties = mysqlTable('transacties', {
  transactieID: int('transactieID').autoincrement().primaryKey(),
  rekeningID: int('rekeningID').notNull(),
  userID: int('userID').notNull(),
  beschrijving: text('beschrijving').notNull(),
  in_uit: mysqlEnum('in_uit', ['IN', 'UIT']).notNull(),
  // decimal moet als string worden ingevoerd bij insert
  bedrag: decimal('bedrag', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),

  datum: text('datum').notNull(),
});

// Tabel categorieen
export const categorieen = mysqlTable('categorieen', {
  categorieID: int('categorieID').autoincrement().primaryKey(),
  categorienaam: text('categorienaam').notNull(),
});

// TransactieCategorie (join table)
export const transactieCategorie = mysqlTable(
  'transactieCategorie',
  {
    transactieID: int('transactieID').notNull(),
    categorieID: int('categorieID').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.transactieID, table.categorieID] }),
  }),
);

// USER TABEL
export const users = mysqlTable(
  'users',
  {
    userid: int('id', { unsigned: true }).primaryKey().autoincrement(),
    voornaam: varchar('voornaam', { length: 255 }).notNull(),
    familienaam: varchar('familienaam', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    paswoord: varchar('password_hash', { length: 255 }).notNull(),
    roles: json('roles').notNull(),
  },
  (table) => [uniqueIndex('idx_user_email_unique').on(table.email)],
);

// Relaties Transacties
export const transactiesRelations = relations(transacties, ({ many }) => ({
  categorieKoppelingen: many(transactieCategorie),
}));

export const transactieCategorieRelations = relations(
  transactieCategorie,
  ({ one }) => ({
    transactie: one(transacties, {
      fields: [transactieCategorie.transactieID],
      references: [transacties.transactieID],
    }),
  }),
);

// ---------------------------------------------------------
// Leiding overzicht & aanwezigheid (LeidingProfiel, Evenement, Aanwezigheid)
// ---------------------------------------------------------

// 1. LeidingProfiel (Extra info voor users)
export const leidingProfiel = mysqlTable('leidingProfiel', {
  profielID: int('profielID').autoincrement().primaryKey(),
  userID: int('userID').notNull(), // FK naar users.userid
  telnr: varchar('telnr', { length: 20 }).notNull(),

  // Leeftijdsgroep (Enum)
  leeftijdsgroep: mysqlEnum('leeftijdsgroep', [
    '-8',
    '-12',
    '-16',
    '+16',
  ]).notNull(),

  // Functies
  functies: json('functies').$type<string[]>().notNull(),
});

// 2. Evenement (Activiteiten, vergaderingen, etc.)
export const evenementen = mysqlTable('evenementen', {
  evenementID: int('evenementID').autoincrement().primaryKey(),
  type: mysqlEnum('type', [
    'ACTIVITEIT',
    'EVENEMENT',
    'VERGADERING',
    'OVERIGE',
  ]).notNull(),
  naam: varchar('naam', { length: 255 }).notNull(),
  beschrijving: text('beschrijving').notNull(),

  datum: date('datum').notNull(),
  startuur: time('startuur').notNull(),
  einduur: time('einduur').notNull(),
});

// 3. Aanwezigheid (Koppeltabel Veel-op-Veel: Users <-> Evenementen)
export const aanwezigheden = mysqlTable('aanwezigheid', {
  aanwezigheidID: int('aanwezigheidID').autoincrement().primaryKey(),
  evenementID: int('evenementID').notNull(), // FK
  userID: int('userID').notNull(), // FK naar de leiding

  status: mysqlEnum('status', ['UNKNOWN', 'PRESENT', 'ABSENT', 'PARTIAL'])
    .default('UNKNOWN')
    .notNull(),

  reden: text('reden'),
  aangepast_startuur: time('aangepast_startuur'),
  aangepast_einduur: time('aangepast_einduur'),
  reminder_sent: boolean('reminder_sent').default(false).notNull(),
});

// ---------------------------------------------------------
// RELATIES (Relations API)
// ---------------------------------------------------------

// Relaties voor Users
export const usersRelations = relations(users, ({ one, many }) => ({
  leidingProfiel: one(leidingProfiel, {
    fields: [users.userid],
    references: [leidingProfiel.userID],
  }),
  aanwezigheden: many(aanwezigheden),
}));

// Relaties voor LeidingProfiel
export const leidingProfielRelations = relations(leidingProfiel, ({ one }) => ({
  user: one(users, {
    fields: [leidingProfiel.userID],
    references: [users.userid],
  }),
}));

// Relaties voor Evenementen
export const evenementenRelations = relations(evenementen, ({ many }) => ({
  aanwezigheden: many(aanwezigheden),
}));

// Relaties voor Aanwezigheid
export const aanwezigheidRelations = relations(aanwezigheden, ({ one }) => ({
  evenement: one(evenementen, {
    fields: [aanwezigheden.evenementID],
    references: [evenementen.evenementID],
  }),
  user: one(users, {
    fields: [aanwezigheden.userID],
    references: [users.userid],
  }),
}));

// ---------------------------------------------------------
// FUNCTIONALITEIT WIJKVERDELING (RONDE)
// ---------------------------------------------------------

// TABEL 1: De Ronde
export const rondes = mysqlTable('rondes', {
  rondeID: int('ronde_id').primaryKey().autoincrement(),
  naam: varchar('naam', { length: 255 }).notNull(),
  datum: timestamp('datum').defaultNow(),
});

// TABEL 2: De Leiding
export const rondeLeiding = mysqlTable(
  'ronde_leiding',
  {
    rondeLeidingID: int('ronde_leiding_id').primaryKey().autoincrement(),
    rondeID: int('ronde_id').notNull(),
    naam: varchar('naam', { length: 255 }).notNull(),
    adres: varchar('adres', { length: 255 }).notNull(),
    lat: decimal('lat', { precision: 10, scale: 7 }),
    lon: decimal('lon', { precision: 10, scale: 7 }),
  },
  (table) => ({
    rondeIdx: index('leiding_ronde_idx').on(table.rondeID),
  }),
);

// TABEL 3: De Huizen (Unieke locaties)
export const rondeHuizen = mysqlTable(
  'ronde_huizen',
  {
    rondeHuisID: int('ronde_huis_id').primaryKey().autoincrement(),
    rondeID: int('ronde_id').notNull(),
    adres: varchar('adres', { length: 255 }).notNull(), // Uniek adres string
    lat: decimal('lat', { precision: 10, scale: 7 }),
    lon: decimal('lon', { precision: 10, scale: 7 }),

    toegewezenLeidingID: int('toegewezen_leiding_id'),

    heeftCoordinaten: boolean('heeft_coordinaten').default(false),
    isBezocht: boolean('is_bezocht').default(false),
  },
  (table) => ({
    rondeIdx: index('huizen_ronde_idx').on(table.rondeID),
    leidingIdx: index('huizen_leiding_idx').on(table.toegewezenLeidingID),
  }),
);

// TABEL 4: De Bewoners (De namen op dat adres)
export const rondeBewoners = mysqlTable('ronde_bewoners', {
  bewonerID: int('bewoner_id').primaryKey().autoincrement(),
  rondeHuisID: int('ronde_huis_id').notNull(), // Link naar het huis
  naam: varchar('naam', { length: 255 }).notNull(), // bv. "Bart Braem"
});

// ---------------------------------------------------------
// RELATIES VOOR RONDE
// ---------------------------------------------------------

export const rondeRelations = relations(rondes, ({ many }) => ({
  huizen: many(rondeHuizen),
  leiding: many(rondeLeiding),
}));

// 👇 DEZE WAS JE VERGETEN EN VEROORZAAKTE DE ERROR
export const rondeLeidingRelations = relations(
  rondeLeiding,
  ({ one, many }) => ({
    ronde: one(rondes, {
      fields: [rondeLeiding.rondeID],
      references: [rondes.rondeID],
    }),
    // Dit zorgt ervoor dat we .findMany({ with: { huizen: true } }) kunnen doen
    huizen: many(rondeHuizen),
  }),
);

export const rondeHuisRelations = relations(rondeHuizen, ({ one, many }) => ({
  ronde: one(rondes, {
    fields: [rondeHuizen.rondeID],
    references: [rondes.rondeID],
  }),
  toegewezenLeiding: one(rondeLeiding, {
    fields: [rondeHuizen.toegewezenLeidingID],
    references: [rondeLeiding.rondeLeidingID],
  }),
  bewoners: many(rondeBewoners), // Een huis heeft meerdere bewoners
}));

export const rondeBewonerRelations = relations(rondeBewoners, ({ one }) => ({
  huis: one(rondeHuizen, {
    fields: [rondeBewoners.rondeHuisID],
    references: [rondeHuizen.rondeHuisID],
  }),
}));
// ---------------------------------------------------------
// Kasjes
// ---------------------------------------------------------
export const kasjes = mysqlTable(
  'kasjes',
  {
    kasjeID: int('kasjeID').autoincrement().primaryKey(),
    // De naam van de groep, bv. "-8", "-12", "+20"
    groep: varchar('groep', { length: 50 }).notNull(),
    // Het jaar waarvoor dit geldt (zodat je historie hebt)
    jaar: int('jaar').notNull(),
    // Het bedrag
    bedrag: decimal('bedrag', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
  },
  (table) => ({
    // Zorgt ervoor dat er per jaar maar 1 regel per groep is
    unq: uniqueIndex('idx_kasje_groep_jaar').on(table.groep, table.jaar),
  }),
);
