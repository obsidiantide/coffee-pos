/** Formats a numeric value or numeric string as an AZN amount, e.g. "12.50 AZN". */
export function azn(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return `${(Number.isFinite(n) ? n : 0).toFixed(2)} AZN`
}
