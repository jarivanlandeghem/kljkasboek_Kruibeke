import {
  mysqlTable,
  serial,
  int,
  decimal,
  date,
  text,
  mysqlEnum,
  primaryKey,
} from 'drizzle-orm/mysql-core';

export const transacties = mysqlTable('transacties', {
  transactieID: serial('transactieID').primaryKey(),
  rekeningID: int('rekeningID').notNull(),
  userID: int('userID').notNull(),
  beschrijving: text('beschrijving').notNull(),
  in_uit: mysqlEnum('in_uit', ['IN', 'UIT']).notNull(),
  bedrag: decimal('bedrag', { precision: 10, scale: 2 }).notNull(),
  datum: date('datum').notNull(),
});

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
