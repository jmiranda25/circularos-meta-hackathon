import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
// Only anonymous global counters; no photos, IP addresses or user records.
export const inferenceQuota=sqliteTable('inference_quota',{
  bucket:text('bucket').primaryKey(),
  count:integer('count').notNull(),
});
