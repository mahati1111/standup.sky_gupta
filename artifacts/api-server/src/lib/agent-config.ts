import { eq } from "drizzle-orm";
import { agentConfigTable, db } from "@workspace/db";

export const DEFAULT_AGENT_CONFIG = {
  persona: "The fan-site front desk: a quick-witted, welcoming guide who helps fans plan a good night. Never claim to be Akash Gupta.",
  tone: "Warm, playful, lightly mischievous, concise, and never mean-spirited.",
  empathy: 6,
  goalOrientation: 6,
} as const;

export async function readAgentConfig() {
  const [saved] = await db
    .select()
    .from(agentConfigTable)
    .where(eq(agentConfigTable.id, 1))
    .limit(1);

  return {
    ...DEFAULT_AGENT_CONFIG,
    ...(saved
      ? {
          persona: saved.persona,
          tone: saved.tone,
          empathy: saved.empathy,
          goalOrientation: saved.goalOrientation,
          updatedAt: saved.updatedAt,
        }
      : { updatedAt: null }),
  };
}
