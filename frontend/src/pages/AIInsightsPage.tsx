import { EmptyState, PageHeader } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { insights } from '../data/demoData'
import type { AnalysisRun } from '../types'

const COUNT_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
] as const

function formatAnomalyCount(count: number): string {
  return count >= 0 && count < COUNT_WORDS.length ? COUNT_WORDS[count] : String(count)
}

function formatList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

/** Formats a CSV timestamp for product copy. Values without a timezone are treated as UTC. */
function formatAnomalyTimestamp(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const hasTimezone = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed)
  const normalized =
    !hasTimezone && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)
      ? `${trimmed}Z`
      : trimmed

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return null

  const year = parsed.getUTCFullYear()
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  const day = String(parsed.getUTCDate()).padStart(2, '0')
  const hour = String(parsed.getUTCHours()).padStart(2, '0')
  const minute = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute} UTC`
}

function eventPhrase(metric: string, count: number): string {
  const latency = /latency/i.test(metric)
  if (latency) {
    return count === 1 ? 'significant latency spike' : 'significant latency spikes'
  }
  return count === 1 ? 'significant anomaly' : 'significant anomalies'
}

function whatHappenedCopy(analysis: AnalysisRun): string {
  const count = analysis.anomalyCount
  const countLabel = formatAnomalyCount(count)
  const events = eventPhrase(analysis.metric, count)
  const closing =
    'These observations deviated significantly from the surrounding baseline and warrant further investigation.'

  // Timestamps were mapped onto each record at adapt time from the selected CSV timestamp column
  // (0-based series index → timestamps[index] → record.detectedAt). Only use them when that
  // column was present; otherwise detectedAt falls back to analysis completion time.
  const timestamps =
    analysis.timestampColumn
      ? analysis.records
          .map((record) => formatAnomalyTimestamp(record.detectedAt))
          .filter((value): value is string => Boolean(value))
      : []

  if (timestamps.length > 0) {
    return `Isolation Forest detected ${countLabel} ${events} in the uploaded ${analysis.metric} series at approximately ${formatList(timestamps)}. ${closing}`
  }

  return `Isolation Forest detected ${countLabel} ${events} in the uploaded series. ${closing}`
}

export function AIInsightsPage() {
  const { latestAnalysis } = useAnalysis()
  const demoInsight = insights[0]

  const insight = latestAnalysis?.explanation
    ? {
        whatHappened: whatHappenedCopy(latestAnalysis),
        impact: latestAnalysis.explanation.businessImpact,
        investigation:
          latestAnalysis.explanation.recommendedActions[0] ??
          'Validate the signal with the system owner.',
      }
    : latestAnalysis
      ? null
      : {
          whatHappened: demoInsight.whatHappened,
          impact: demoInsight.whyItMatters,
          investigation: demoInsight.investigation,
        }

  return (
    <div className="page">
      <PageHeader
        title="AI Insights"
        description={
          latestAnalysis
            ? 'AI-generated context for the latest analysis, subject to human validation.'
            : 'Representative AI context for the highest-priority demo anomaly.'
        }
      />

      {latestAnalysis?.anomalyCount === 0 ? (
        <section className="panel">
          <EmptyState
            title="No insight generated"
            description="The latest analysis contained no anomaly flags."
          />
        </section>
      ) : insight ? (
        <article className="panel insight-summary">
          <section>
            <h2>What happened</h2>
            <p>{insight.whatHappened}</p>
          </section>
          <section>
            <h2>Potential impact</h2>
            <p>{insight.impact}</p>
          </section>
          <section>
            <h2>Recommended investigation</h2>
            <p>{insight.investigation}</p>
          </section>
        </article>
      ) : (
        <section className="panel">
          <EmptyState
            title="AI insight unavailable"
            description="Anomaly detection succeeded, but the optional explanation service did not return a valid response."
          />
        </section>
      )}
    </div>
  )
}
