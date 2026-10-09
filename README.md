# Laksh

Laksh is a React Native personal finance app that goes beyond passive expense tracking. It logs spending, ties every rupee back to a savings goal, and layers in a set of lightweight AI-agent behaviors — real-time nudges, user-defined spending rules, proactive recaps, and pattern detection — all computed entirely on-device.

## Why Laksh

Most expense trackers are passive: you log data, and the app shows you a chart. Laksh is built to be a step more active — it reacts to what you log, remembers your habits, and surfaces things you didn't ask to see, without needing a backend or sending your data anywhere.

## Tech Stack

- **Framework:** React Native (Expo SDK 57), Expo Router
- **Language:** TypeScript
- **State:** Zustand, persisted to AsyncStorage
- **UI:** React Native Paper, Inter fonts, custom dark theme with amber/gold accents
- **File handling:** `expo-document-picker`, `expo-file-system`, `papaparse` (CSV import)
- **Date/calendar input:** `@react-native-community/datetimepicker`

No backend, no database — the entire app runs on local persisted state.

## Features

### Core screens

| Screen       | What it does                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Login**    | Branded entry point with mock phone + OTP flow (use `1234` to continue)                                                  |
| **Home**     | Today's spend, monthly budget progress, quick-add categories, recent transactions, and the agent cards described below   |
| **Goals**    | Active goal with saved/target/progress/daily-saving-suggestion, plus other goals you can switch between or contribute to |
| **Insights** | Week / Month / 3-month spending breakdown by category, period-over-period comparison, and computed spending patterns     |
| **Rewards**  | Real logging streak, AI tier progression (Assistant → Analyst → CFO → Oracle), and streak-gated reward unlocks           |

### Agentic features

Everything below is rule-based and runs locally — no external API calls, no cost, nothing that can silently fail in a demo.

- **Real-time expense feedback** — the moment an expense is saved, Laksh checks it against the monthly budget and the active goal's daily saving target, and shows an immediate, contextual message (budget warning, goal trade-off, or encouragement).
- **Commitment-based nudges** — users can set their own rules ("max 3 Food orders per week") from the expense sheet. Laksh enforces them automatically and warns the moment a rule is broken — a constraint the user opts into, not one Laksh imposes.
- **Proactive weekly recap** — once a calendar week has fully passed, the next time the app is opened, Laksh automatically shows a "your week in money" summary (total spend, top category, change vs. the week before) without the user having to look for it.
- **Frequency observations** — if a category is logged 3+ times within the current week, Laksh surfaces a neutral, factual card ("You've logged Food 3 times this week — ₹420 total"). No judgment, no suggested fix — just the pattern.
- **Weekday pattern suggestions** — if the same category shows up on the same weekday across 3+ distinct weeks, Laksh surfaces a one-tap "Log it" shortcut (and, where relevant, a deep link into the matching app — Uber, Swiggy, etc. — with a web fallback if the app isn't installed).
- **Learned auto-categorization** — Laksh remembers which category a user picks for a given note keyword (e.g. "swiggy" → Food). After two consistent picks, it auto-selects that category the next time the keyword appears, with a visible "auto-categorized" hint the user can override.
- **Ask Laksh (conversational query)** — a chat-style interface that answers plain-language questions ("How much did I spend on chai this week?", "How's my goal going?") by querying the local stores directly. Currently rule-based keyword matching, not a true LLM — see Roadmap.
- **Bank statement import (CSV)** — new users can upload a CSV export of their bank statement instead of starting from zero. Laksh parses common column formats (Date, Narration, Debit), guesses a category per transaction, and shows a review list before anything is imported. Shown automatically on first launch; available any time after via a manual "Import bank statement" link on Home.

## Architecture Notes

- **Stores, not a database.** Each domain (expenses, goals, settings, commitments, category memory, weekly report tracking) has its own Zustand store with `persist` + AsyncStorage. No backend is needed because nothing here requires sync across devices or server-side computation.
- **Derived data over cached data.** Totals, streaks, budget percentages, and patterns are all computed on read from the raw `expenses`/`goals` arrays (see `utils/`), not stored redundantly. This keeps the stores simple and avoids stale-data bugs.
- **Agent logic is pure and testable.** Every piece of "AI" behavior (`streak.ts`, `goalMath.ts`, `weeklyFrequency.ts`, `patternDetection.ts`, `checkCommitments.ts`, `weeklyReport.ts`, `queryAgent.ts`, `parseStatementCsv.ts`) is a plain function with no React or storage dependency, making it straightforward to unit test.
- **v1 is rule-based by design.** Every "smart" feature here uses explicit thresholds and keyword matching rather than a model, which keeps the app fully offline, free to run, and predictable in a demo. The intent is for this logic to be swappable for a real LLM later without changing the UI layer — see Roadmap.

## Known Limitations

- **SMS auto-capture is not implemented.** Reading bank/UPI SMS requires a native Android module and a custom dev client (incompatible with Expo Go), and has no iOS equivalent. Expenses are entered manually or via CSV import.
- **CSV import only** — PDF statement parsing was considered but needs OCR/text-extraction work with far less predictable formatting across banks, so it's deferred.
- **No real-time payment blocking.** Laksh cannot intercept or block a transaction in another app (e.g. Swiggy); nudges are reactive (shown immediately after logging) or proactive within the constraints the user has opted into (commitments).
- **Ask Laksh uses keyword matching, not NLP.** Phrasing matters; it won't understand arbitrary rewordings of a question.
- **Deep link suggestions aren't personalized to a route** — they open the target app generally, not with pre-filled pickup/dropoff. True route prefill would require capturing location data over time, which isn't currently collected.

## Roadmap

- Settings screen (editable monthly budget, reset data, logout)
- Edit/delete for logged expenses
- Unit tests for all pure utility functions
- `strict: true` TypeScript, full ESLint pass
- Swap `queryAgent.ts`'s rule-based matching for a real LLM call via a thin serverless proxy (keeps the API key off-device; no database needed since the proxy stays stateless)
- EAS build for an installable APK/IPA
- Optional: Firebase/Supabase for real phone OTP auth and cross-device sync

## Setup

```bash
npm install
npx expo start
```

Requires Expo Go (SDK 57) or a custom dev client. Use OTP `1234` on the phone verification screen to proceed past mock authentication.
