import { api } from "./client";

export interface UsageSummary {
  plan: "FREE" | "STANDARD" | "PRO";
  summary: { used: number; limit: number };
  flashcards: { used: number; limit: number };
  chatMessages: { used: number; limit: number };
}

export async function getUsage(): Promise<UsageSummary> {
  const res = await api.get("/student/usage");
  return res.data.data;
}
