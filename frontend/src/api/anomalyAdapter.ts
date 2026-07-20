import type { ExplanationResponse, PredictResponse } from './client'
import type {
  AnalysisExplanation,
  AnalysisRun,
  AnomalyRecord,
  Severity,
  TrendPoint,
} from '../types'

export interface AnalysisInput {
  fileName: string
  fileSize: number
  metric: string
  values: number[]
  timestamps?: string[]
  timestampColumn?: string
  startedAt: number
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length
}

function baselineAt(values: number[], index: number): number {
  const priorWindow = values.slice(Math.max(0, index - 20), index)
  return priorWindow.length > 0 ? mean(priorWindow) : values[index]
}

function formatValue(value: number): string {
  const magnitude = Math.abs(value)
  const maximumFractionDigits = magnitude >= 100 ? 1 : magnitude >= 10 ? 2 : 3
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value)
}

function labelAt(index: number, timestamps?: string[]): string {
  const timestamp = timestamps?.[index]?.trim()
  if (!timestamp) return `Point ${index + 1}`

  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return timestamp
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed)
}

/**
 * Presentation-only severity mapping for the prototype.
 *
 * The backend returns a continuous Isolation Forest decision score where more-negative values
 * indicate stronger anomalies. It does not return severity. These fixed display bands never
 * alter the original score and should be calibrated against production operating data before use.
 */
export function severityFromScore(score: number): Severity {
  if (score <= -0.2) return 'Critical'
  if (score <= -0.1) return 'High'
  if (score <= -0.05) return 'Medium'
  return 'Low'
}

function toExplanation(response?: ExplanationResponse): AnalysisExplanation | undefined {
  if (!response) return undefined
  return {
    rootCauses: response.explanation.root_causes,
    operationalImpact: response.explanation.impact.operational,
    businessImpact: response.explanation.impact.business,
    recommendedActions: response.explanation.recommended_actions,
    assumptions: response.explanation.assumptions,
    uncertainty: response.explanation.uncertainty,
    sources: response.sources,
  }
}

function detailSeries(
  values: number[],
  index: number,
  timestamps?: string[],
): TrendPoint[] {
  const start = Math.max(0, index - 10)
  const end = Math.min(values.length, index + 11)
  return values.slice(start, end).map((value, offset) => {
    const sourceIndex = start + offset
    return {
      label: labelAt(sourceIndex, timestamps),
      value,
      baseline: baselineAt(values, sourceIndex),
    }
  })
}

function overviewSeries(
  values: number[],
  anomaly: Array<number | null>,
  timestamps?: string[],
): TrendPoint[] {
  const maximumPoints = 300
  const step = Math.max(1, Math.ceil(values.length / maximumPoints))
  const indexes = new Set<number>()

  for (let index = 0; index < values.length; index += step) indexes.add(index)
  anomaly.forEach((flag, index) => {
    if (flag === 1) indexes.add(index)
  })

  return [...indexes]
    .sort((left, right) => left - right)
    .map((index) => ({
      label: labelAt(index, timestamps),
      value: values[index],
      baseline: baselineAt(values, index),
      anomalies: anomaly[index] === 1 ? 1 : 0,
      anomalyValue: anomaly[index] === 1 ? values[index] : undefined,
    }))
}

/**
 * Converts the backend contract into product records.
 *
 * System name, expected value, severity, impact, and actions are not ML outputs:
 * - system is labeled "CSV import" because no source system is provided;
 * - expected value is a prior-20-point rolling mean for display only;
 * - severity uses the documented presentation bands above;
 * - impact/actions use the real explanation response when available, otherwise explicitly state
 *   that the model does not provide them.
 */
export function adaptAnalysisResponse(
  input: AnalysisInput,
  prediction: PredictResponse,
  explanationResponse?: ExplanationResponse,
): AnalysisRun {
  const explanation = toExplanation(explanationResponse)
  const analysisId = `CSV-${Date.now()}`
  const completedAt = new Date().toISOString()
  const records: AnomalyRecord[] = []
  const potentialImpact =
    explanation?.businessImpact?.trim() ||
    'Potential impact is not provided by the anomaly-detection model.'
  const explanationText =
    explanation?.rootCauses.filter(Boolean).join(' ').trim() ||
    'Isolation Forest flagged this observation as unusual. No AI explanation was returned.'
  const explainedActions = explanation?.recommendedActions?.filter(Boolean) ?? []
  const recommendedActions =
    explainedActions.length > 0
      ? explainedActions
      : [
          'Validate the source reading and units.',
          'Review adjacent observations for related operational signals.',
        ]

  prediction.anomaly.forEach((flag, index) => {
    if (flag !== 1) return
    const score = prediction.anomaly_score[index]
    if (score === null) return

    const baseline = baselineAt(input.values, index)
    const detectedLabel = labelAt(index, input.timestamps)
    const sourceTimestamp = input.timestamps?.[index]?.trim() || undefined
    records.push({
      id: `${analysisId}-${String(index + 1).padStart(4, '0')}`,
      origin: 'uploaded',
      system: 'CSV import',
      metric: input.metric,
      severity: severityFromScore(score),
      status: 'New',
      observedValue: formatValue(input.values[index]),
      baselineValue: formatValue(baseline),
      score,
      detectedAt: sourceTimestamp || completedAt,
      sourceTimestamp,
      relativeTime: detectedLabel,
      observationIndex: index + 1,
      potentialImpact,
      explanation: explanationText,
      recommendedActions,
      series: detailSeries(input.values, index, input.timestamps),
      model: {
        algorithm: 'Isolation Forest',
        signal: 'Unsupervised anomaly detection',
        warmupWindow: `${prediction.warmup_points_dropped} points`,
        source: input.fileName,
      },
    })
  })

  return {
    id: analysisId,
    origin: 'uploaded',
    fileName: input.fileName,
    fileSize: input.fileSize,
    metric: input.metric,
    timestampColumn: input.timestampColumn,
    pointCount: input.values.length,
    anomalyCount: records.length,
    completedAt,
    durationMs: Date.now() - input.startedAt,
    warmupPointsDropped: prediction.warmup_points_dropped,
    records,
    series: overviewSeries(input.values, prediction.anomaly, input.timestamps),
    explanation,
    explanationUnavailable: records.length > 0 && !explanation,
  }
}
