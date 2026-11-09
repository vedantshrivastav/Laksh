import { api } from "./api";

/**
 * Asks the backend's AI agent a question. The server builds the user's data summary
 * itself (from Mongo), so the app only sends the question and the timezone.
 *
 * Returns null (never throws) if the server is unreachable, rate-limited, or the AI
 * provider fails. Callers should fall back to the offline rule-based agent.
 */
export async function askLLM(question: string): Promise<string | null> {
  try {
    const res = await api.post<{ answer?: string }>(
      "/agent/ask",
      {
        question,
        // lets the server work out "today" and "this month" in the user's timezone
        tzOffsetMinutes: new Date().getTimezoneOffset(),
      },
      { timeoutMs: 20000 }
    );

    const answer = typeof res?.answer === "string" ? res.answer.trim() : "";
    return answer || null;
  } catch {
    return null;
  }
}