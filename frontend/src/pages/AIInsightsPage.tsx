import { EmptyState, PageHeader } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { insights } from '../data/demoData'

export function AIInsightsPage() {
  const { latestAnalysis } = useAnalysis()
  const demoInsight = insights[0]

  const insight = latestAnalysis?.explanation
    ? {
        whatHappened: `${latestAnalysis.anomalyCount} of ${latestAnalysis.pointCount.toLocaleString()} observations were flagged. ${latestAnalysis.explanation.rootCauses[0] ?? ''}`.trim(),
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
