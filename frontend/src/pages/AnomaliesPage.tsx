import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { EmptyState, PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { anomalies as demoAnomalies } from '../data/demoData'
import type { AnomalyRecord } from '../types'

const severityTone = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function AnomaliesPage() {
  const { latestAnalysis } = useAnalysis()
  const anomalies = latestAnalysis?.records ?? demoAnomalies
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
          ? [...drawer.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])')]
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

  function openDetails(anomaly: AnomalyRecord) {
    setSelected(anomaly)
  }

  return (
    <div className="page">
      <PageHeader
        title="Anomalies"
        description={
          latestAnalysis
            ? `Unusual behavior detected in ${latestAnalysis.fileName}.`
            : 'Representative unusual behavior detected across monitored systems.'
        }
      />

      <section className="panel table-panel anomalies-table">
        {anomalies.length === 0 ? (
          <EmptyState
            title="No anomalies detected"
            description="The latest analysis completed without anomaly flags."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <caption className="visually-hidden">Detected anomalies</caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">Score</th>
                  <th scope="col">Timestamp</th>
                  <th scope="col">System</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly) => (
                  <tr
                    className="clickable-row"
                    key={anomaly.id}
                    tabIndex={0}
                    aria-label={`Open details for ${anomaly.metric} on ${anomaly.system}`}
                    onClick={() => openDetails(anomaly)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openDetails(anomaly)
                      }
                    }}
                  >
                    <td>
                      <StatusBadge tone={severityTone[anomaly.severity]}>
                        {anomaly.severity}
                      </StatusBadge>
                    </td>
                    <td className="score-cell">{anomaly.score.toFixed(3)}</td>
                    <td>{formatTimestamp(anomaly.detectedAt)}</td>
                    <td className="table-primary">{anomaly.system}</td>
                    <td>{anomaly.status}</td>
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
          <aside
            className="detail-drawer detail-drawer-simple"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="drawer-header">
              <div>
                <StatusBadge tone={severityTone[selected.severity]}>
                  {selected.severity}
                </StatusBadge>
                <h2 id="detail-title">{selected.metric}</h2>
                <p>{selected.system}</p>
              </div>
              <button
                ref={closeButtonRef}
                className="icon-button"
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close anomaly details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="drawer-content">
              <dl className="simple-detail-list">
                <div>
                  <dt>Observed</dt>
                  <dd>{selected.observedValue}</dd>
                </div>
                <div>
                  <dt>Display baseline</dt>
                  <dd>{selected.baselineValue}</dd>
                </div>
                <div>
                  <dt>Anomaly score</dt>
                  <dd>{selected.score.toFixed(3)}</dd>
                </div>
                <div>
                  <dt>Timestamp</dt>
                  <dd>{formatTimestamp(selected.detectedAt)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt>Finding ID</dt>
                  <dd>{selected.id}</dd>
                </div>
              </dl>
              <p className="score-explainer">
                More-negative scores indicate stronger model deviation; the score is not a
                probability.
              </p>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
