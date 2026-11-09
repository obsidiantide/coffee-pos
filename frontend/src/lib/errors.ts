interface ApiErrorLike {
  response?: {
    status?: number
    data?: { detail?: unknown; non_field_errors?: unknown[] } | null
  }
}

function asApiError(err: unknown): ApiErrorLike {
  return typeof err === 'object' && err !== null ? (err as ApiErrorLike) : {}
}

/** HTTP status of a failed API request, if the error carries a response. */
export function getErrorStatus(err: unknown): number | undefined {
  return asApiError(err).response?.status
}

/** Human-readable message from a DRF-style error response, or the fallback. */
export function getErrorMessage(err: unknown, fallback: string): string {
  const data = asApiError(err).response?.data
  if (typeof data?.detail === 'string' && data.detail) return data.detail
  const first = data?.non_field_errors?.[0]
  if (typeof first === 'string' && first) return first
  return fallback
}
