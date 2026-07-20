export interface PredictResponse {
  warmup_points_dropped: number
  anomaly: Array<number | null>
  anomaly_score: Array<number | null>
  message?: string
}

export interface ExplanationResponse {
  explanation: {
    root_causes: string[]
    impact: {
      operational: string
      business: string
    }
    recommended_actions: string[]
    assumptions: string[]
    uncertainty: string
  }
  sources: string[]
}

export type ApiErrorCode =
  | 'configuration'
  | 'timeout'
  | 'unavailable'
  | 'invalid_response'
  | 'request_failed'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor(
    code: ApiErrorCode,
    message: string,
    status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
export const API_BASE_URL = configuredBaseUrl?.replace(/\/$/, '') || '/api'
export const API_DOCS_URL =
  (import.meta.env.VITE_API_DOCS_URL as string | undefined) || `${API_BASE_URL}/docs`

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isPredictResponse(payload: unknown): payload is PredictResponse {
  if (!payload || typeof payload !== 'object') return false
  const candidate = payload as Partial<PredictResponse>
  return (
    Number.isInteger(candidate.warmup_points_dropped) &&
    Array.isArray(candidate.anomaly) &&
    candidate.anomaly.every(
      (value) => value === null || value === 0 || value === 1,
    ) &&
    Array.isArray(candidate.anomaly_score) &&
    candidate.anomaly_score.every(isNullableNumber) &&
    (candidate.message === undefined || typeof candidate.message === 'string')
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isExplanationResponse(payload: unknown): payload is ExplanationResponse {
  if (!payload || typeof payload !== 'object') return false
  const candidate = payload as Partial<ExplanationResponse>
  const explanation = candidate.explanation
  return Boolean(
    explanation &&
      isStringArray(explanation.root_causes) &&
      explanation.impact &&
      typeof explanation.impact.operational === 'string' &&
      typeof explanation.impact.business === 'string' &&
      isStringArray(explanation.recommended_actions) &&
      isStringArray(explanation.assumptions) &&
      typeof explanation.uncertainty === 'string' &&
      isStringArray(candidate.sources),
  )
}

async function request<T>(
  path: string,
  body: unknown,
  validate: (payload: unknown) => payload is T,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      throw new ApiError(
        response.status >= 500 ? 'unavailable' : 'request_failed',
        response.status >= 500
          ? 'The analysis service is temporarily unavailable. Please retry shortly.'
          : 'The analysis request was rejected. Check the uploaded data and try again.',
        response.status,
      )
    }

    if (!validate(payload)) {
      throw new ApiError(
        'invalid_response',
        'The analysis service returned an unexpected response. No results were saved.',
      )
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('timeout', 'The analysis took too long. Please retry with a smaller file.')
    }
    throw new ApiError(
      'unavailable',
      'Unable to reach the analysis service. Confirm it is running and try again.',
    )
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function predictAnomalies(values: number[]): Promise<PredictResponse> {
  const response = await request(
    '/anomaly/predict',
    { values },
    isPredictResponse,
    45_000,
  )

  if (
    response.anomaly.length !== values.length ||
    response.anomaly_score.length !== values.length
  ) {
    throw new ApiError(
      'invalid_response',
      'The analysis response did not align with the uploaded observations.',
    )
  }

  return response
}

export function explainAnomaly(
  anomalyOutput: Record<string, unknown>,
): Promise<ExplanationResponse> {
  return request(
    '/explain-anomaly',
    { anomaly_output: anomalyOutput },
    isExplanationResponse,
    15_000,
  )
}
