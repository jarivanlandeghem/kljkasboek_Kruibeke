// src/drizzle/schema.ts
import {
  mysqlTable,
  int,
  decimal,
  date,
  text,
  mysqlEnum,
  primaryKey,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
//  Transacties

// Opmerking AI:
// Let op: 'date()' verwacht een string in formaat 'YYYY-MM-DD', geen JS Date-object.
// Als je liever DateTime wilt opslaan, gebruik 'timestamp()' in plaats van 'date()'.
export const transacties = mysqlTable('transacties', {
  transactieID: int('transactieID').autoincrement().primaryKey(),
  rekeningID: int('rekeningID').notNull(),
  userID: int('userID').notNull(),
  beschrijving: text('beschrijving').notNull(),
  in_uit: mysqlEnum('in_uit', ['IN', 'UIT']).notNull(),
  //  decimal moet als string worden ingevoerd bij insert
  bedrag: decimal('bedrag', { precision: 10, scale: 2 }).notNull(),
  //  date verwacht string, niet Date-object
  datum: date('datum').notNull(),
});

//  TransactieCategorie (join table)
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
