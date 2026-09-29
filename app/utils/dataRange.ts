export type Period = "week" | "month" | "3m";

export function getRange(period: Period) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  if (period === "week") start.setDate(now.getDate() - 6);
  if (period === "month") start.setDate(now.getDate() - 29);
  if (period === "3m") start.setDate(now.getDate() - 89);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getPreviousRange(period: Period) {
  const { start } = getRange(period);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd);

  if (period === "week") prevStart.setDate(prevEnd.getDate() - 6);
  if (period === "month") prevStart.setDate(prevEnd.getDate() - 29);
  if (period === "3m") prevStart.setDate(prevEnd.getDate() - 89);

  prevStart.setHours(0, 0, 0, 0);
  return { start: prevStart, end: prevEnd };
}