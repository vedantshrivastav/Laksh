import Papa from "papaparse";
import type { Category } from "../storage/useExpenseStore";
import type { MemoryEntry } from "../storage/useCategoryMemoryStore";
import { suggestCategoryFromMemory, extractKeyword } from "./learnCategory";

export type ParsedRow = {
  id: string;
  date: string; // ISO
  description: string;
  amount: number;
  suggestedCategory: Category;
  include: boolean;
};

const DATE_KEYS = ["date", "txn date", "transaction date", "value date"];
const DESC_KEYS = ["description", "narration", "particulars", "details", "remarks"];
const DEBIT_KEYS = ["debit", "withdrawal amt", "withdrawal", "dr", "debit amount"];
const AMOUNT_KEYS = ["amount", "amt"];

function normalize(h: string) {
  return h.trim().toLowerCase();
}

function findKey(headers: string[], candidates: string[]): string | null {
  for (const h of headers) {
    if (candidates.includes(normalize(h))) return h;
  }
  return null;
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const [, dd, mm, yyyyRaw] = m;
    const yyyy = yyyyRaw.length === 2 ? `20${yyyyRaw}` : yyyyRaw;
    const d = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function guessCategory(text: string, memory: Record<string, MemoryEntry>): Category {
  const learned = suggestCategoryFromMemory(text, memory);
  if (learned) return learned;

  const lower = text.toLowerCase();
  if (lower.includes("swiggy") || lower.includes("zomato")) return "food";
  if (
    lower.includes("uber") ||
    lower.includes("ola") ||
    lower.includes("irctc") ||
    lower.includes("metro")
  )
    return "transport";
  if (lower.includes("amazon") || lower.includes("flipkart") || lower.includes("myntra"))
    return "shopping";
  if (lower.includes("electricity") || lower.includes("recharge") || lower.includes("bill"))
    return "bills";
  if (lower.includes("chai") || lower.includes("cafe") || lower.includes("coffee")) return "chai";
  return "others";
}

export function parseStatementCsv(
  csvText: string,
  memory: Record<string, MemoryEntry>
): { rows: ParsedRow[]; error: string | null } {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.data.length === 0) {
    return { rows: [], error: "Couldn't read any rows from this file." };
  }

  const headers = parsed.meta.fields ?? [];
  const dateKey = findKey(headers, DATE_KEYS);
  const descKey = findKey(headers, DESC_KEYS);
  const debitKey = findKey(headers, DEBIT_KEYS);
  const amountKey = findKey(headers, AMOUNT_KEYS);

  if (!dateKey || (!debitKey && !amountKey)) {
    return {
      rows: [],
      error:
        "Couldn't detect Date and Amount columns. Make sure this is a standard bank statement CSV export.",
    };
  }

  const rows: ParsedRow[] = [];

  parsed.data.forEach((raw, i) => {
    const date = parseDate(raw[dateKey] ?? "");
    if (!date) return;

    let amount = 0;
    if (debitKey) {
      amount = parseFloat((raw[debitKey] || "0").replace(/[^0-9.-]/g, ""));
      if (!amount || amount <= 0) return; // skip credits / blank debit rows
    } else if (amountKey) {
      const val = parseFloat((raw[amountKey] || "0").replace(/[^0-9.-]/g, ""));
      if (!val || val >= 0) return; // only negative values treated as spend
      amount = Math.abs(val);
    }

    const description = descKey ? (raw[descKey] || "").trim() : "Imported transaction";

    rows.push({
      id: `row-${i}`,
      date,
      description,
      amount,
      suggestedCategory: guessCategory(description, memory),
      include: true,
    });
  });

  return {
    rows,
    error: rows.length === 0 ? "No expense transactions found in this file." : null,
  };
}