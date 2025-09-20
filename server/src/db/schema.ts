import { serial, text, pgTable, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const dogsTable = pgTable('dogs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  breed: text('breed').notNull(),
  description: text('description'), // Nullable by default, matches Zod schema
  logo_url: text('logo_url'), // URL for dog logo/avatar
  photo_url: text('photo_url'), // URL for main photo
  age: integer('age'), // Nullable age field
  is_featured: boolean('is_featured').notNull().default(false), // Featured dogs for homepage
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Dog = typeof dogsTable.$inferSelect; // For SELECT operations
export type NewDog = typeof dogsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { dogs: dogsTable };