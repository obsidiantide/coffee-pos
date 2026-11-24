export type ExpenseValidation =
  | { ok: true; description: string; amount: number }
  | { ok: false; error: string }

/** Validate raw expense form input and normalise it for the API. */
export function validateExpense(description: string, amount: string): ExpenseValidation {
  const trimmed = description.trim()
  if (!trimmed || !amount.trim()) {
    return { ok: false, error: 'Please fill in all fields' }
  }
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, error: 'Amount must be greater than zero' }
  }
  return { ok: true, description: trimmed, amount: Math.round(value * 100) / 100 }
}
