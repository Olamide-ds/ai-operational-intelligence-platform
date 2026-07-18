import {
  ArrowRight,
  BrainCircuit,
  CircleGauge,
  SearchCheck,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DemoNotice, EmptyState, PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { insights } from '../data/demoData'

const priorityTone = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

const evidenceTone = {
  'Strong signal': 'success',
  'Moderate signal': 'info',
  'Limited context': 'warning',
} as const

export function AIInsightsPage() {
  const { latestAnalysis } = useAnalysis()

  return (
    <div className="page">
      <PageHeader
        eyebrow="Decision support"
        title="Investigation insights"
        description="Prioritized context that helps teams move from detection to investigation."
      />

      <div className="ai-disclaimer" role="note">
        <ShieldAlert size={19} />
        <div>
          <strong>Human validation required</strong>
          <p>
            AI-generated explanations are decision-support material and should be validated by the
            team responsible for the affected system.
          </p>
        </div>
      </div>

      <DemoNotice label={latestAnalysis ? 'Uploaded result' : 'Demo data'}>
        {latestAnalysis
          ? `Showing enrichment status for ${latestAnalysis.fileName}. The current retrieval layer uses CPU-focused prototype runbooks and may not match every uploaded metric.`
          : 'These insights are representative examples based on the demo anomaly scenarios.'}
      </DemoNotice>

      {latestAnalysis ? (
        latestAnalysis.anomalyCount === 0 ? (
          <div className="panel">
            <EmptyState
              title="No anomaly explanation requested"
              description="The latest uploaded series contained no anomaly flags, so AI enrichment was not called."
            />
          </div>
        ) : latestAnalysis.explanation ? (
          <article className="insight-card uploaded-insight">
            <div className="insight-rank">01</div>
            <div className="insight-content">
              <div className="insight-header">
                <div className="insight-badges">
                  <StatusBadge tone="success">Uploaded result</StatusBadge>
                  <StatusBadge tone="info">{latestAnalysis.explanation.uncertainty}</StatusBadge>
                </div>
                <span>{latestAnalysis.id}</span>
              </div>
              <h2>{latestAnalysis.metric}: analysis explanation</h2>
              <div className="insight-sections">
                <div>
                  <div className="insight-label">
                    <BrainCircuit size={16} />
                    What happened
                  </div>
                  <p>
                    {latestAnalysis.anomalyCount} of {latestAnalysis.pointCount.toLocaleString()}{' '}
                    observations were flagged by the Isolation Forest model.{' '}
                    {latestAnalysis.explanation.rootCauses.join(' ')}
                  </p>
                </div>
                <div>
                  <div className="insight-label">
                    <CircleGauge size={16} />
                    Why it may matter
                  </div>
                  <p>{latestAnalysis.explanation.businessImpact}</p>
                </div>
                <div>
                  <div className="insight-label">
                    <SearchCheck size={16} />
                    Recommended investigation
                  </div>
                  <p>{latestAnalysis.explanation.recommendedActions.join(' ')}</p>
                </div>
              </div>
              <details className="provenance-details">
                <summary>Explanation provenance</summary>
                <dl className="provenance-list">
                  <div>
                    <dt>Operational impact</dt>
                    <dd>{latestAnalysis.explanation.operationalImpact}</dd>
                  </div>
                  <div>
                    <dt>Retrieved sources</dt>
                    <dd>
                      {latestAnalysis.explanation.sources.length > 0
                        ? latestAnalysis.explanation.sources.join(', ')
                        : 'No source identifiers returned'}
                    </dd>
                  </div>
                  <div>
                    <dt>Assumptions</dt>
                    <dd>
                      {latestAnalysis.explanation.assumptions.length > 0
                        ? latestAnalysis.explanation.assumptions.join(' ')
                        : 'No assumptions returned'}
                    </dd>
                  </div>
                  <div>
                    <dt>Uncertainty</dt>
                    <dd>{latestAnalysis.explanation.uncertainty}</dd>
                  </div>
                </dl>
              </details>
              <footer className="insight-footer">
                <span>
                  Related: <strong>CSV import</strong> · {latestAnalysis.fileName}
                </span>
                <Link to="/anomalies" className="text-link">
                  Review anomalies <ArrowRight size={15} />
                </Link>
              </footer>
            </div>
          </article>
        ) : (
          <div className="panel">
            <EmptyState
              title="AI explanation unavailable"
              description="Anomaly detection completed successfully, but the optional explanation service did not return a valid response. The model results remain available."
            />
          </div>
        )
      ) : (
        <section className="insight-list">
          {insights.map((insight, index) => (
            <article className="insight-card" key={insight.id}>
              <div className="insight-rank">{String(index + 1).padStart(2, '0')}</div>
              <div className="insight-content">
                <div className="insight-header">
                  <div className="insight-badges">
                    <StatusBadge tone={priorityTone[insight.priority]}>
                      {insight.priority}
                    </StatusBadge>
                    <StatusBadge tone={evidenceTone[insight.evidence]}>
                      {insight.evidence}
                    </StatusBadge>
                  </div>
                  <span>{insight.id}</span>
                </div>
                <h2>{insight.title}</h2>
                <div className="insight-sections">
                  <div>
                    <div className="insight-label">
                      <BrainCircuit size={16} />
                      What happened
                    </div>
                    <p>{insight.whatHappened}</p>
                  </div>
                  <div>
                    <div className="insight-label">
                      <CircleGauge size={16} />
                      Why it may matter
                    </div>
                    <p>{insight.whyItMatters}</p>
                  </div>
                  <div>
                    <div className="insight-label">
                      <SearchCheck size={16} />
                      Recommended investigation
                    </div>
                    <p>{insight.investigation}</p>
                  </div>
                </div>
                <footer className="insight-footer">
                  <span>
                    Related: <strong>{insight.system}</strong> · {insight.anomalyId}
                  </span>
                  <Link to="/anomalies" className="text-link">
                    Review anomaly <ArrowRight size={15} />
                  </Link>
                </footer>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
