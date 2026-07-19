import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import {
  anomalies as demoAnomalies,
  anomalyTrend,
  dashboardStats,
} from '../data/demoData'

const severityTone = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

export function OverviewPage() {
  const { latestAnalysis } = useAnalysis()
  const anomalies =
    latestAnalysis?.records ?? demoAnomalies.filter((record) => record.status !== 'Resolved')
  const criticalAlerts = anomalies.filter((record) => record.severity === 'Critical').length
  const chartData = latestAnalysis?.series ?? anomalyTrend

  const metrics = [
    {
      label: 'Overall Health',
      value: anomalies.length === 0 ? 'Healthy' : 'Needs attention',
    },
    { label: 'Active Anomalies', value: anomalies.length },
    {
      label: 'Critical Alerts',
      value: latestAnalysis ? criticalAlerts : dashboardStats.criticalAlerts,
    },
    { label: 'Connected Data Sources', value: 1 },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Overview"
        description="Current operational health and the most recent detected anomalies."
      />

      <section className="summary-metrics" aria-label="Operational summary">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel simple-chart-panel">
        <div className="panel-header">
          <div>
            <h2>{latestAnalysis ? latestAnalysis.metric : 'Anomaly trend'}</h2>
            <p>{latestAnalysis ? latestAnalysis.fileName : 'Detected anomalies over seven days'}</p>
          </div>
          <StatusBadge tone={latestAnalysis ? 'success' : 'neutral'}>
            {latestAnalysis ? 'Uploaded result' : 'Demo data'}
          </StatusBadge>
        </div>
        <div
          className="chart-container"
          role="img"
          aria-label={
            latestAnalysis
              ? `${latestAnalysis.metric} with ${latestAnalysis.anomalyCount} detected anomalies`
              : 'Demo anomaly count over seven days'
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis tickLine={false} axisLine={false} width={34} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={latestAnalysis ? 'value' : 'anomalies'}
                name={latestAnalysis ? 'Observed' : 'Anomalies'}
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Recent anomalies</h2>
            <p>{latestAnalysis ? 'Latest uploaded analysis' : 'Representative demo findings'}</p>
          </div>
        </div>
        {anomalies.length === 0 ? (
          <div className="empty-state">
            <h3>No anomalies detected</h3>
            <p>The latest analysis completed without anomaly flags.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <caption className="visually-hidden">Most recent detected anomalies</caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">System</th>
                  <th scope="col">Metric</th>
                  <th scope="col">Status</th>
                  <th scope="col">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.slice(0, 5).map((anomaly) => (
                  <tr key={anomaly.id}>
                    <td>
                      <StatusBadge tone={severityTone[anomaly.severity]}>
                        {anomaly.severity}
                      </StatusBadge>
                    </td>
                    <td className="table-primary">{anomaly.system}</td>
                    <td>{anomaly.metric}</td>
                    <td>{anomaly.status}</td>
                    <td>{anomaly.relativeTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
