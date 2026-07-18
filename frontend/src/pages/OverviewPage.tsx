import {
  Activity,
  ArrowRight,
  CircleAlert,
  Clock3,
  Database,
  Server,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalysis } from '../context/useAnalysis'
import {
  anomalies as demoAnomalies,
  anomalyTrend,
  dashboardStats,
  monitoredSystems,
} from '../data/demoData'
import { DemoNotice, PageHeader, StatusBadge } from '../components/ui'

const severityTone = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

function formatAnalysisTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OverviewPage() {
  const { latestAnalysis } = useAnalysis()
  const hasUploadedAnalysis = Boolean(latestAnalysis)
  const activeAnomalies =
    latestAnalysis?.records ?? demoAnomalies.filter((record) => record.status !== 'Resolved')
  const criticalCount = activeAnomalies.filter((record) => record.severity === 'Critical').length
  const chartData = latestAnalysis?.series ?? anomalyTrend
  const chartIsTimeSeries = Boolean(latestAnalysis)

  const stats = [
    {
      label: hasUploadedAnalysis ? 'Latest analysis status' : 'Operational health',
      value: hasUploadedAnalysis
        ? activeAnomalies.length === 0
          ? 'No anomalies'
          : 'Needs attention'
        : dashboardStats.health,
      note: hasUploadedAnalysis
        ? `${latestAnalysis?.metric} from uploaded CSV`
        : '2 demo systems require attention',
      icon: ShieldCheck,
      tone: activeAnomalies.length === 0 ? 'success' : 'warning',
    },
    {
      label: 'Active anomalies',
      value: activeAnomalies.length,
      note: hasUploadedAnalysis ? 'Detected in latest upload' : 'Across 3 demo systems',
      icon: Activity,
      tone: activeAnomalies.length === 0 ? 'success' : 'info',
    },
    {
      label: hasUploadedAnalysis ? 'Critical anomalies' : 'Critical alerts',
      value: hasUploadedAnalysis ? criticalCount : dashboardStats.criticalAlerts,
      note: hasUploadedAnalysis
        ? 'UI score bands—not production SLA severity'
        : 'Demo alert requiring review',
      icon: CircleAlert,
      tone: criticalCount > 0 ? 'critical' : 'success',
    },
    {
      label: hasUploadedAnalysis ? 'Analyzed series' : 'Monitored systems',
      value: hasUploadedAnalysis ? 1 : dashboardStats.monitoredSystems,
      note: hasUploadedAnalysis ? latestAnalysis?.fileName : 'Representative demo systems',
      icon: Server,
      tone: 'success',
    },
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Demo workspace"
        title="Operational overview"
        description="Detect operational risks before they become business disruptions."
        actions={
          <Link className="button button-primary" to="/data-sources">
            Analyze operational data <ArrowRight size={16} />
          </Link>
        }
      />

      <DemoNotice label={hasUploadedAnalysis ? 'Uploaded result' : 'Demo data'}>
        {hasUploadedAnalysis
          ? `Metrics labeled “Uploaded result” come from ${latestAnalysis?.fileName}. Named systems remain demo data.`
          : 'Dashboard metrics are representative demo data until a CSV analysis is completed.'}
      </DemoNotice>

      <section className="stat-grid" aria-label="Operational summary">
        {stats.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon stat-icon-${tone}`}>
              <Icon size={19} />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-note">{note}</div>
          </article>
        ))}
      </section>

      <section className="overview-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                {hasUploadedAnalysis ? latestAnalysis?.metric : 'Last 7 days'}
              </p>
              <h2>{hasUploadedAnalysis ? 'Analyzed operational signal' : 'Anomaly trend'}</h2>
            </div>
            <StatusBadge tone={hasUploadedAnalysis ? 'success' : 'neutral'}>
              {hasUploadedAnalysis ? 'Uploaded result' : 'Demo data'}
            </StatusBadge>
          </div>
          <div
            className="chart-container"
            role="img"
            aria-label={
              latestAnalysis
                ? `${latestAnalysis.metric} with ${latestAnalysis.anomalyCount} detected anomalies across ${latestAnalysis.pointCount} observations`
                : 'Demo count of detected anomalies over seven days'
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tickLine={false} axisLine={false} allowDecimals />
                <Tooltip />
                {chartIsTimeSeries ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Display baseline"
                      stroke="var(--text-subtle)"
                      strokeDasharray="5 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Observed"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="anomalyValue"
                      name="Detected anomaly"
                      stroke="transparent"
                      connectNulls={false}
                      dot={{ r: 4, fill: 'var(--critical)', strokeWidth: 0 }}
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="anomalies"
                    name="Anomalies"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--surface)', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend" aria-hidden="true">
            {chartIsTimeSeries ? (
              <>
                <span><i className="legend-line legend-observed" />Observed</span>
                <span><i className="legend-line legend-baseline" />Display baseline</span>
                <span><i className="legend-dot-chart" />Detected anomaly</span>
              </>
            ) : (
              <span><i className="legend-line legend-observed" />Detected anomalies</span>
            )}
          </div>
        </article>

        <article className="panel status-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ingestion</p>
              <h2>Analysis status</h2>
            </div>
            <Database size={19} className="muted-icon" />
          </div>
          <div className="ingestion-state">
            <span className="health-dot health-dot-success" />
            <div>
              <strong>{hasUploadedAnalysis ? 'Latest upload processed' : 'CSV path configured'}</strong>
              <p>Results persist for this browser session</p>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Latest source</dt>
              <dd>{latestAnalysis?.fileName ?? 'Demo telemetry dataset'}</dd>
            </div>
            <div>
              <dt>Last analyzed</dt>
              <dd>
                {latestAnalysis
                  ? formatAnalysisTime(latestAnalysis.completedAt)
                  : dashboardStats.lastAnalysis}
              </dd>
            </div>
            <div>
              <dt>Points analyzed</dt>
              <dd>{latestAnalysis?.pointCount.toLocaleString() ?? '2,880'}</dd>
            </div>
            <div>
              <dt>Anomalies detected</dt>
              <dd>{latestAnalysis?.anomalyCount ?? dashboardStats.activeAnomalies}</dd>
            </div>
          </dl>
          <Link to="/data-sources" className="text-link">
            Manage data sources <ArrowRight size={15} />
          </Link>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Triage queue</p>
            <h2>Recent anomalies</h2>
          </div>
          <Link to="/anomalies" className="text-link">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {activeAnomalies.length === 0 ? (
          <div className="no-anomalies-state">
            <ShieldCheck size={20} />
            <div>
              <strong>No anomalies detected</strong>
              <p>The latest uploaded series produced no anomaly flags.</p>
            </div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <caption className="visually-hidden">
                Recent detected anomalies in the current workspace
              </caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">System</th>
                  <th scope="col">Metric</th>
                  <th scope="col">Observed</th>
                  <th scope="col">Status</th>
                  <th scope="col">{latestAnalysis ? 'Observation' : 'Detected'}</th>
                </tr>
              </thead>
              <tbody>
                {activeAnomalies.slice(0, 6).map((anomaly) => (
                  <tr key={anomaly.id}>
                    <td>
                      <StatusBadge tone={severityTone[anomaly.severity]}>
                        {anomaly.severity}
                      </StatusBadge>
                    </td>
                    <td className="table-primary">{anomaly.system}</td>
                    <td>{anomaly.metric}</td>
                    <td>{anomaly.observedValue}</td>
                    <td>{anomaly.status}</td>
                    <td>{anomaly.relativeTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">{hasUploadedAnalysis ? 'Uploaded result' : 'Demo systems'}</p>
            <h2>{hasUploadedAnalysis ? 'Latest analyzed signal' : 'Systems requiring attention'}</h2>
          </div>
          <span className="last-analysis">
            <Clock3 size={15} />{' '}
            {latestAnalysis
              ? formatAnalysisTime(latestAnalysis.completedAt)
              : `Last analyzed ${dashboardStats.lastAnalysis}`}
          </span>
        </div>
        <div className="attention-grid">
          {hasUploadedAnalysis ? (
            <article className="attention-card">
              <div className="attention-card-top">
                <div className="system-icon">
                  {activeAnomalies.length > 0 ? (
                    <TriangleAlert size={18} />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                </div>
                <StatusBadge tone={activeAnomalies.length > 0 ? 'warning' : 'success'}>
                  {activeAnomalies.length > 0 ? 'Attention' : 'No anomalies'}
                </StatusBadge>
              </div>
              <h3>CSV import</h3>
              <p>{latestAnalysis?.metric}</p>
              <div className="metric-comparison">
                <div>
                  <span>Observations</span>
                  <strong>{latestAnalysis?.pointCount.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Anomalies</span>
                  <strong>{latestAnalysis?.anomalyCount}</strong>
                </div>
              </div>
            </article>
          ) : (
            monitoredSystems
              .filter((system) => system.status !== 'Healthy')
              .map((system) => (
                <article className="attention-card" key={system.id}>
                  <div className="attention-card-top">
                    <div className="system-icon">
                      <TriangleAlert size={18} />
                    </div>
                    <StatusBadge tone={system.status === 'Degraded' ? 'critical' : 'warning'}>
                      {system.status}
                    </StatusBadge>
                  </div>
                  <h3>{system.name}</h3>
                  <p>{system.metric}</p>
                  <div className="metric-comparison">
                    <div>
                      <span>Latest</span>
                      <strong>{system.latestReading}</strong>
                    </div>
                    <div>
                      <span>Baseline</span>
                      <strong>{system.baseline}</strong>
                    </div>
                  </div>
                </article>
              ))
          )}
        </div>
      </section>
    </div>
  )
}
