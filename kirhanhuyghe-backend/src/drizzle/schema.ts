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

  // Functies (Set/Lijst van rollen zoals 'Kassier', 'EHBO').
  // JSON is de standaard manier in Drizzle om arrays/sets op te slaan in MySQL.
  functies: json('functies').$type<string[]>().notNull(),
});

// 2. Evenement (Activiteiten, vergaderingen, etc.)
export const evenementen = mysqlTable('evenementen', {
  evenementID: int('evenementID').autoincrement().primaryKey(),
  // Hierop filter je voor de <3 regel
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

  // Status Enum (PARTIAL = Aangepast)
  status: mysqlEnum('status', ['UNKNOWN', 'PRESENT', 'ABSENT', 'PARTIAL'])
    .default('UNKNOWN')
    .notNull(),

  // Verplicht bij ABSENT/PARTIAL
  reden: text('reden'),

  // Verplicht bij PARTIAL
  aangepast_startuur: time('aangepast_startuur'),
  aangepast_einduur: time('aangepast_einduur'),

  // Boolean om de "1 week reminder" bij te houden
  reminder_sent: boolean('reminder_sent').default(false).notNull(),
});

// ---------------------------------------------------------
// RELATIES (Relations API)
// ---------------------------------------------------------

// Relaties voor Users (Koppeling naar Profiel en Aanwezigheden)
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

// Relaties voor Aanwezigheid (De link tussen User en Evenement)
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
