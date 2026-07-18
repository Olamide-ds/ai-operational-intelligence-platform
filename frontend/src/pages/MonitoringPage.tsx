import { Activity, Clock3, Server, TriangleAlert } from 'lucide-react'
import { DemoNotice, PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { monitoredSystems } from '../data/demoData'

const statusTone = {
  Healthy: 'success',
  Watch: 'warning',
  Degraded: 'critical',
} as const

export function MonitoringPage() {
  const { latestAnalysis } = useAnalysis()

  return (
    <div className="page">
      <PageHeader
        eyebrow="System monitoring"
        title="Operational monitoring"
        description="Review representative system health alongside the latest uploaded analysis."
      />
      <DemoNotice label="Demo systems">
        Named systems and readings are representative demo data. Uploaded CSV analysis is shown
        separately because the API does not return a system identity.
      </DemoNotice>

      {latestAnalysis && (
        <section className="imported-monitoring-card">
          <div>
            <p className="eyebrow">Uploaded result</p>
            <h2>CSV import · {latestAnalysis.metric}</h2>
            <span>{latestAnalysis.fileName}</span>
          </div>
          <div className="imported-monitoring-stats">
            <div>
              <span>Observations</span>
              <strong>{latestAnalysis.pointCount.toLocaleString()}</strong>
            </div>
            <div>
              <span>Anomalies</span>
              <strong>{latestAnalysis.anomalyCount}</strong>
            </div>
            <StatusBadge tone={latestAnalysis.anomalyCount > 0 ? 'warning' : 'success'}>
              {latestAnalysis.anomalyCount > 0 ? 'Attention' : 'No anomalies'}
            </StatusBadge>
          </div>
        </section>
      )}

      {latestAnalysis && (
        <div className="section-heading demo-fleet-heading">
          <div>
            <p className="eyebrow">Illustrative fleet</p>
            <h2>Sample systems — not derived from the upload</h2>
          </div>
        </div>
      )}

      <section className="monitoring-summary">
        <article>
          <Server size={18} />
          <div>
            <span>Demo system profiles</span>
            <strong>5</strong>
          </div>
        </article>
        <article>
          <Activity size={18} />
          <div>
            <span>Healthy examples</span>
            <strong>2</strong>
          </div>
        </article>
        <article>
          <TriangleAlert size={18} />
          <div>
            <span>Requiring attention</span>
            <strong>3</strong>
          </div>
        </article>
        <article>
          <Clock3 size={18} />
          <div>
            <span>Demo cadence</span>
            <strong>Illustrative</strong>
          </div>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Representative data</p>
            <h2>Demo operational services</h2>
          </div>
          <StatusBadge tone="neutral">Representative data</StatusBadge>
        </div>
        <div className="table-scroll">
          <table>
            <caption className="visually-hidden">
              Representative operational services using demo data
            </caption>
            <thead>
              <tr>
                <th scope="col">System</th>
                <th scope="col">Status</th>
                <th scope="col">Key metric</th>
                <th scope="col">Latest reading</th>
                <th scope="col">Baseline</th>
                <th scope="col">Sample timestamp</th>
                <th scope="col">Active anomalies</th>
              </tr>
            </thead>
            <tbody>
              {monitoredSystems.map((system) => (
                <tr key={system.id}>
                  <td>
                    <div className="system-cell">
                      <span className={`system-health system-health-${system.status.toLowerCase()}`} />
                      <span className="table-primary">{system.name}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge tone={statusTone[system.status]}>{system.status}</StatusBadge>
                  </td>
                  <td>{system.metric}</td>
                  <td className="table-primary">{system.latestReading}</td>
                  <td>{system.baseline}</td>
                  <td>{system.lastUpdated}</td>
                  <td>
                    <span className={system.activeAnomalies > 0 ? 'count-alert' : 'count-neutral'}>
                      {system.activeAnomalies}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="monitoring-cards">
        {monitoredSystems.map((system) => (
          <article className="monitoring-card" key={system.id}>
            <div className="monitoring-card-header">
              <div>
                <h3>{system.name}</h3>
                <p>{system.metric}</p>
              </div>
              <StatusBadge tone={statusTone[system.status]}>{system.status}</StatusBadge>
            </div>
            <div className="monitoring-value">
              <span>Latest reading</span>
              <strong>{system.latestReading}</strong>
            </div>
            <div className="monitoring-meta">
              <span>Baseline {system.baseline}</span>
              <span>{system.activeAnomalies} active anomalies</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
