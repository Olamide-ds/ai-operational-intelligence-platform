import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DemoNotice, EmptyState, PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { anomalies as demoAnomalies } from '../data/demoData'
import type { AnomalyRecord, AnomalyStatus, Severity } from '../types'

const severityTone = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

const severityRank: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

type SortOption = 'newest' | 'severity' | 'score'

export function AnomaliesPage() {
  const { latestAnalysis } = useAnalysis()
  const anomalies = latestAnalysis?.records ?? demoAnomalies
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<Severity | 'All'>('All')
  const [status, setStatus] = useState<AnomalyStatus | 'All'>('All')
  const [system, setSystem] = useState('All')
  const [sort, setSort] = useState<SortOption>('newest')
  const [selected, setSelected] = useState<AnomalyRecord | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selected) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleDialogKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
      if (event.key === 'Tab') {
        const drawer = closeButtonRef.current?.closest<HTMLElement>('[role="dialog"]')
        const focusable = drawer
          ? [...drawer.querySelectorAll<HTMLElement>('button, a, input, select, [tabindex]:not([tabindex="-1"])')]
          : []
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleDialogKeydown)

    return () => {
      window.removeEventListener('keydown', handleDialogKeydown)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus()
    }
  }, [selected])

  const systems = useMemo(
    () => [...new Set(anomalies.map((anomaly) => anomaly.system))],
    [anomalies],
  )

  const filteredAnomalies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return anomalies
      .filter(
        (anomaly) =>
          (!normalizedQuery ||
            anomaly.id.toLowerCase().includes(normalizedQuery) ||
            anomaly.system.toLowerCase().includes(normalizedQuery) ||
            anomaly.metric.toLowerCase().includes(normalizedQuery)) &&
          (severity === 'All' || anomaly.severity === severity) &&
          (status === 'All' || anomaly.status === status) &&
          (system === 'All' || anomaly.system === system),
      )
      .sort((a, b) => {
        if (sort === 'severity') return severityRank[b.severity] - severityRank[a.severity]
        if (sort === 'score') return a.score - b.score
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      })
  }, [anomalies, query, severity, status, system, sort])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Investigation queue"
        title="Detected anomalies"
        description="Prioritize unusual operational behavior and move findings through investigation."
      />
      <DemoNotice label={latestAnalysis ? 'Uploaded result' : 'Demo data'}>
        {latestAnalysis
          ? `Showing model results generated from ${latestAnalysis.fileName}. Severity is a UI mapping of anomaly score; thresholds are not production-calibrated.`
          : 'The records below are realistic demonstration scenarios and are not live production alerts.'}
      </DemoNotice>

      <section className="filter-bar" aria-label="Anomaly filters">
        <label className="search-field">
          <span className="visually-hidden">Search anomalies</span>
          <Search size={17} />
          <input
            type="search"
            placeholder="Search system, metric, or ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="filter-select">
          <span>Severity</span>
          <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity | 'All')}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AnomalyStatus | 'All')}
          >
            {['All', 'New', 'Investigating', 'Resolved'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <span>System</span>
          <select value={system} onChange={(event) => setSystem(event.target.value)}>
            <option>All</option>
            {systems.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="filter-select sort-select">
          <span>Sort</span>
          <ArrowDownUp size={14} />
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            <option value="newest">Newest</option>
            <option value="severity">Severity</option>
            <option value="score">Anomaly score</option>
          </select>
        </label>
      </section>

      <div className="results-summary" aria-live="polite">
        <span>
          <SlidersHorizontal size={15} /> {filteredAnomalies.length} detected anomalies
        </span>
        <span>{latestAnalysis ? 'Uploaded result' : 'Demo workspace'}</span>
      </div>

      <section className="panel table-panel anomalies-table">
        {filteredAnomalies.length === 0 ? (
          <EmptyState
            title={
              latestAnalysis?.anomalyCount === 0
                ? 'No anomalies detected'
                : 'No anomalies match these filters'
            }
            description={
              latestAnalysis?.anomalyCount === 0
                ? 'The latest uploaded series completed successfully without anomaly flags.'
                : 'Adjust the search or filters to view other anomaly records.'
            }
          />
        ) : (
          <div className="table-scroll">
            <table>
              <caption className="visually-hidden">
                Detected anomalies matching the current filters
              </caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">Anomaly</th>
                  <th scope="col">System</th>
                  <th scope="col">Observed / baseline</th>
                  <th scope="col">Anomaly score</th>
                  <th scope="col">Status</th>
                  <th scope="col">{latestAnalysis ? 'Observation' : 'Detected'}</th>
                  <th scope="col" aria-label="Open anomaly details" />
                </tr>
              </thead>
              <tbody>
                {filteredAnomalies.map((anomaly) => (
                  <tr key={anomaly.id}>
                    <td>
                      <StatusBadge tone={severityTone[anomaly.severity]}>
                        {anomaly.severity}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="anomaly-cell">
                        <button
                          type="button"
                          className="table-row-link"
                          onClick={() => setSelected(anomaly)}
                        >
                          {anomaly.metric}
                        </button>
                        <small>{anomaly.id}</small>
                      </div>
                    </td>
                    <td>{anomaly.system}</td>
                    <td>
                      <span className="table-primary">{anomaly.observedValue}</span>
                      <small className="baseline-inline"> / {anomaly.baselineValue}</small>
                    </td>
                    <td className="score-cell">{anomaly.score.toFixed(3)}</td>
                    <td>{anomaly.status}</td>
                    <td>{anomaly.relativeTime}</td>
                    <td>
                      <button
                        className="row-action"
                        aria-label={`Open ${anomaly.id}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelected(anomaly)
                        }}
                      >
                        <ChevronRight size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} aria-hidden="true" />
          <aside className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="drawer-header">
              <div>
                <div className="drawer-badges">
                  <StatusBadge tone={severityTone[selected.severity]}>{selected.severity}</StatusBadge>
                  <StatusBadge tone="neutral">{selected.status}</StatusBadge>
                  <StatusBadge tone={selected.origin === 'uploaded' ? 'success' : 'neutral'}>
                    {selected.origin === 'uploaded' ? 'Uploaded result' : 'Demo data'}
                  </StatusBadge>
                </div>
                <h2 id="detail-title">{selected.metric}</h2>
                <p>
                  {selected.system} · {selected.id}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close anomaly details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="drawer-content">
              <section className="detail-metrics">
                <div>
                  <span>Observed</span>
                  <strong>{selected.observedValue}</strong>
                </div>
                <div>
                  <span>Display baseline</span>
                  <strong>{selected.baselineValue}</strong>
                </div>
                <div>
                  <span>Anomaly score</span>
                  <strong>{selected.score.toFixed(3)}</strong>
                </div>
                <div>
                  <span>{selected.origin === 'uploaded' ? 'Observation' : 'Detected'}</span>
                  <strong>{selected.relativeTime}</strong>
                </div>
              </section>
              <p className="score-explainer">
                More-negative anomaly scores indicate stronger model deviation. The score is not
                a probability or confidence measure.
              </p>

              <section className="drawer-section">
                <h3>Signal around detection</h3>
                <div
                  className="detail-chart"
                  role="img"
                  aria-label={`Observed ${selected.metric} compared with the display baseline`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selected.series} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="baseline"
                        name="Baseline"
                        stroke="var(--text-subtle)"
                        strokeDasharray="5 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Observed"
                        stroke="var(--accent)"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-legend" aria-hidden="true">
                  <span><i className="legend-line legend-observed" />Observed</span>
                  <span><i className="legend-line legend-baseline" />Display baseline</span>
                </div>
              </section>

              <section className="drawer-section">
                <h3>Potential business impact</h3>
                <p>{selected.potentialImpact}</p>
              </section>

              <section className="drawer-section ai-detail">
                <div className="section-icon-title">
                  <BrainCircuit size={18} />
                  <h3>
                    {selected.origin === 'uploaded' && !latestAnalysis?.explanation
                      ? 'Detection context'
                      : 'AI explanation'}
                  </h3>
                </div>
                <p>{selected.explanation}</p>
                <span>
                  {selected.origin === 'uploaded'
                    ? latestAnalysis?.explanation
                      ? 'Batch explanation for all flagged points · Validate with the responsible team'
                      : 'AI explanation was not returned for this analysis'
                    : 'Demo explanation · Validate with the responsible team'}
                </span>
                {selected.origin === 'uploaded' && latestAnalysis?.explanation && (
                  <dl className="provenance-list compact-provenance">
                    <div>
                      <dt>Operational impact</dt>
                      <dd>{latestAnalysis.explanation.operationalImpact}</dd>
                    </div>
                    <div>
                      <dt>Sources</dt>
                      <dd>
                        {latestAnalysis.explanation.sources.length > 0
                          ? latestAnalysis.explanation.sources.join(', ')
                          : 'No source identifiers returned'}
                      </dd>
                    </div>
                    <div>
                      <dt>Uncertainty</dt>
                      <dd>{latestAnalysis.explanation.uncertainty}</dd>
                    </div>
                  </dl>
                )}
              </section>

              <section className="drawer-section">
                <h3>Recommended investigation</h3>
                <ul className="action-list">
                  {selected.recommendedActions.map((action) => (
                    <li key={action}>
                      <CheckCircle2 size={16} />
                      {action}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="drawer-section model-metadata">
                <h3>Model metadata</h3>
                <dl className="detail-list">
                  <div>
                    <dt>Algorithm</dt>
                    <dd>{selected.model.algorithm}</dd>
                  </div>
                  <div>
                    <dt>Signal</dt>
                    <dd>{selected.model.signal}</dd>
                  </div>
                  <div>
                    <dt>Warmup</dt>
                    <dd>{selected.model.warmupWindow}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{selected.model.source}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
