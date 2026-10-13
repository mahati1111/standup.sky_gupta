import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const agentConfigTable = pgTable("agent_config", {
  id: integer("id").primaryKey(),
  persona: varchar("persona", { length: 500 }).notNull(),
  tone: varchar("tone", { length: 200 }).notNull(),
  empathy: integer("empathy").notNull().default(6),
  goalOrientation: integer("goal_orientation").notNull().default(6),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAgentConfigSchema = createInsertSchema(agentConfigTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertAgentConfig = z.infer<typeof insertAgentConfigSchema>;
export type AgentConfig = typeof agentConfigTable.$inferSelect;
