import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const communityPostsTable = pgTable("community_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  author: varchar("author", { length: 40 }).notNull(),
  message: varchar("message", { length: 400 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPostsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPostsTable.$inferSelect;

export const bookingRequestsTable = pgTable("booking_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  showId: varchar("show_id", { length: 80 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  quantity: integer("quantity").notNull(),
  total: integer("total").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  status: varchar("status", { length: 32 }).notNull().default("sample_request"),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingRequestSchema = createInsertSchema(bookingRequestsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;
export type BookingRequestRecord = typeof bookingRequestsTable.$inferSelect;
