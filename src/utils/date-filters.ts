import { parseBrazilianDate } from "@/utils/parse-brazilian-date";

/** Quantos meses antes do atual a home deixa consultar (limite só de UX; o backend aceita qualquer período). */
const HOME_MONTHS_BACK = 3;

/** Período em dias locais; `to` é inclusivo. */
export interface DateRange {
  from: Date;
  to: Date;
}

export function isSameMonth(dateValue: string, reference: Date): boolean {
  const date = parseBrazilianDate(dateValue);
  return (
    date.getMonth() === reference.getMonth() &&
    date.getFullYear() === reference.getFullYear()
  );
}

export function isSameDay(dateValue: string, reference: Date): boolean {
  const date = parseBrazilianDate(dateValue);
  return date.toDateString() === reference.toDateString();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function today(): Date {
  return startOfDay(new Date());
}

export function currentMonthRange(): DateRange {
  const now = today();
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
}

export function previousMonthRange(): DateRange {
  const now = today();
  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    to: new Date(now.getFullYear(), now.getMonth(), 0),
  };
}

/** Primeiro dia que a home deixa consultar: dia 1 de (mês atual − 3). */
export function homeMinDate(): Date {
  const now = today();
  return new Date(now.getFullYear(), now.getMonth() - HOME_MONTHS_BACK, 1);
}

export function homeFullRange(): DateRange {
  return { from: homeMinDate(), to: today() };
}

export function isSameRange(a: DateRange, b: DateRange): boolean {
  return (
    a.from.getTime() === b.from.getTime() && a.to.getTime() === b.to.getTime()
  );
}

/**
 * Converte o período local em instantes UTC pro backend (que grava CreatedAt em UTC):
 * `from` = início do primeiro dia, `to` = início do dia seguinte ao último (exclusivo).
 */
export function toApiParams(range: DateRange): { from: string; to: string } {
  return {
    from: startOfDay(range.from).toISOString(),
    to: addDays(range.to, 1).toISOString(),
  };
}

/** Date local → "yyyy-MM-dd" (formato do `<input type="date">`). */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "yyyy-MM-dd" → Date local; `null` se vazio ou inválido. */
export function fromDateInputValue(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);

  if (!(year && month && day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatRangeLabel(range: DateRange): string {
  const format = (date: Date) =>
    date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const sameYear = range.from.getFullYear() === range.to.getFullYear();
  const suffix = sameYear ? "" : `/${range.to.getFullYear()}`;
  const prefix = sameYear ? "" : `/${range.from.getFullYear()}`;

  return `${format(range.from)}${prefix} – ${format(range.to)}${suffix}`;
}
