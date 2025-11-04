// src/drizzle/schema.ts
import {
  mysqlTable,
  int,
  decimal,
  //  date,
  text,
  mysqlEnum,
  primaryKey,
  varchar,
  uniqueIndex,
  json,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
//  Transacties
export const transacties = mysqlTable('transacties', {
  transactieID: int('transactieID').autoincrement().primaryKey(),
  rekeningID: int('rekeningID').notNull(),
  userID: int('userID').notNull(),
  beschrijving: text('beschrijving').notNull(),
  in_uit: mysqlEnum('in_uit', ['IN', 'UIT']).notNull(),
  //  decimal moet als string worden ingevoerd bij insert
  bedrag: decimal('bedrag', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),

  datum: text('datum').notNull(),
});

// tabel categorieen
export const categorieen = mysqlTable('categorieen', {
  categorieID: int('categorieID').autoincrement().primaryKey(),
  categorienaam: text('categorienaam').notNull(),
  type: mysqlEnum('type', ['IN', 'UIT']).notNull(),
});
//  TransactieCategorie (join table) TODO
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

// TODO USER TABEL
// src/drizzle/schema.ts
export const users = mysqlTable(
  'users',
  {
    userid: int('id', { unsigned: true }).primaryKey().autoincrement(),
    voornaam: varchar('voornaam', { length: 255 }).notNull(),
    familienaam: varchar('familienaam', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(), // 👈
    paswoord: varchar('password_hash', { length: 255 }).notNull(), // 👈
    roles: json('roles').notNull(), // 👈
  },
  (table) => [uniqueIndex('idx_user_email_unique').on(table.email)], // 👈
);
// verenigingID ineens dat die er is

// AI gedaan? TODO
export const transactiesRelations = relations(transacties, ({ many }) => ({
  categorieKoppelingen: many(transactieCategorie), // <-- Relatie naar de join-tabel
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
