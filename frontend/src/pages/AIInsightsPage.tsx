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

function formatIndexList(indexes: number[]): string {
  if (indexes.length === 0) return ''
  if (indexes.length === 1) return String(indexes[0])
  if (indexes.length === 2) return `${indexes[0]} and ${indexes[1]}`
  return `${indexes.slice(0, -1).join(', ')}, and ${indexes[indexes.length - 1]}`
}

function whatHappenedCopy(analysis: AnalysisRun): string {
  const count = analysis.anomalyCount
  const countLabel = formatAnomalyCount(count)
  const anomalyWord = count === 1 ? 'anomaly' : 'anomalies'
  const indexWord = count === 1 ? 'index' : 'indices'
  const indexes = analysis.records.map((record) => record.observationIndex)
  const indexClause =
    indexes.length > 0 ? ` at ${indexWord} ${formatIndexList(indexes)}` : ''

  return `Isolation Forest detected ${countLabel} ${anomalyWord} in the uploaded ${analysis.metric} series${indexClause}. These observations deviate significantly from the surrounding baseline and warrant further investigation.`
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
