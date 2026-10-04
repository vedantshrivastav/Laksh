import type { Category } from "../storage/useExpenseStore";
import type { MemoryEntry } from "../storage/useCategoryMemoryStore";

const MIN_CONFIDENCE = 2; // require 2+ past agreements before auto-suggesting

/** Uses the first word of the note as the matching keyword (e.g. "swiggy dinner" -> "swiggy"). */
export function extractKeyword(note: string): string {
  return note.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}

export function suggestCategoryFromMemory(
  note: string,
  memory: Record<string, MemoryEntry>
): Category | null {
  const key = extractKeyword(note);
  if (!key) return null;

  const entry = memory[key];
  if (entry && entry.count >= MIN_CONFIDENCE) {
    return entry.category;
  }
  return null;
}