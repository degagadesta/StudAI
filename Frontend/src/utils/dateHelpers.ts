// utils/dateHelpers.ts

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * >= 24h away  -> "N days left"  (days only, never mixed with hours)
 * < 24h away   -> "N hours left" (hours only)
 * already due  -> "Due now"
 */
export function getRemainingTimeLabel(dateStr: string): string {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  if (diffMs <= 0) return "Due now";

  const totalHours = diffMs / (1000 * 60 * 60);

  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    return `${days} day${days === 1 ? "" : "s"} left`;
  }

  const hours = Math.ceil(totalHours);
  return `${hours} hour${hours === 1 ? "" : "s"} left`;
}

export function urgencyTier(dateStr: string): "urgent" | "soon" | "later" {
  const hours = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hours <= 24) return "urgent";
  if (hours <= 72) return "soon";
  return "later";
}
