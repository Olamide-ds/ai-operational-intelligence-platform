import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { buildDashboardModel } from '../data/dashboard'

const severityTone = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

const statusTone = {
  New: 'info',
  Open: 'info',
  Investigating: 'high',
  Monitoring: 'warning',
  Resolved: 'success',
} as const

function formatAxisValue(value: number | string): string {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return ''
  if (Math.abs(numeric) >= 1_000_000) {
    return `${(numeric / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (Math.abs(numeric) >= 1000) {
    return `${Math.round(numeric / 1000)}k`
  }
  return String(Math.round(numeric))
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 72
      const y = 22 - ((value - min) / span) * 18
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg className="ops-spark" viewBox="0 0 72 24" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  )
}

export function OverviewPage() {
  const { latestAnalysis } = useAnalysis()
  const navigate = useNavigate()
  const model = useMemo(() => buildDashboardModel(latestAnalysis), [latestAnalysis])
  const [question, setQuestion] = useState('')

  function askAssistant(event: FormEvent, preset?: string) {
    event.preventDefault()
    const next = (preset ?? question).trim()
    navigate(next ? `/investigations?q=${encodeURIComponent(next)}` : '/investigations')
  }

  return (
    <div className="page ops-page">
      <header className="ops-hero">
        <div>
          <h1>{model.greeting}</h1>
          <p>{model.subtitle}</p>
        </div>
      </header>

      <div className="ops-grid">
        <section className="ops-kpis" aria-label="Operational summary">
          {model.kpis.map((kpi) => (
            <article key={kpi.label} className="ops-kpi">
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <em className={`ops-delta ops-delta-${kpi.tone}`}>
                {kpi.tone === 'down' ? '↓' : '↑'} {kpi.delta}
                <small>vs. previous period</small>
              </em>
            </article>
          ))}
        </section>

        <section className="ops-ai" aria-labelledby="ops-ai-title">
          <div className="ops-ai-head">
            <h2 id="ops-ai-title">AI Investigation Assistant</h2>
            <span>BETA</span>
          </div>
          <p>{model.assistantPrompt}</p>
          <form className="ops-ai-form" onSubmit={(event) => askAssistant(event)}>
            <Search size={16} aria-hidden="true" />
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question..."
              aria-label="Ask the investigation assistant"
            />
            <button type="submit" aria-label="Ask assistant">
              <ArrowRight size={16} />
            </button>
          </form>
          <ul className="ops-ai-suggestions">
            {model.suggestedQuestions.map((item) => (
              <li key={item}>
                <button type="button" onClick={(event) => askAssistant(event, item)}>
                  <Search size={14} aria-hidden="true" />
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="ops-panel ops-chart-panel">
          <div className="ops-panel-head">
            <h2>{model.chartTitle}</h2>
            <div className="ops-legend">
              <span>
                <i className="ops-legend-line" /> {model.chartCaption}
              </span>
              <span>
                <i className="ops-legend-dot" /> Anomalies
              </span>
            </div>
          </div>
          <div
            className="ops-chart"
            role="img"
            aria-label={`${model.chartTitle} over the selected window`}
          >
            {model.annotation && <div className="ops-callout">{model.annotation.text}</div>}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={model.chart} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6edf5" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tick={{ fontSize: 11, fill: '#8b97a8' }}
                  tickFormatter={formatAxisValue}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={model.chartCaption}
                  stroke="#2f6bff"
                  strokeWidth={2.4}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="anomalyValue"
                  name="Anomalies"
                  stroke="#ef4444"
                  strokeWidth={0}
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ops-panel ops-donut-panel">
          <h2>Anomaly Breakdown</h2>
          <div className="ops-donut-wrap">
            <div className="ops-donut" role="img" aria-label="Anomaly breakdown by type">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={model.breakdown}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {model.breakdown.map((slice) => (
                      <Cell key={slice.label} fill={slice.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="ops-donut-label">
                <strong>{model.breakdownTotal}</strong>
                <span>anomalies</span>
              </div>
            </div>
            <ul>
              {model.breakdown.map((slice) => (
                <li key={slice.label}>
                  <i style={{ background: slice.color }} />
                  <span>{slice.label}</span>
                  <strong>{slice.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ops-panel ops-table-panel">
          <div className="ops-panel-head">
            <h2>Recent Anomalies</h2>
            <Link to="/anomalies">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <caption className="visually-hidden">Most recent detected anomalies</caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Service</th>
                  <th scope="col">Metric</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {model.anomalies.slice(0, 5).map((anomaly) => (
                  <tr key={anomaly.id}>
                    <td>{anomaly.relativeTime}</td>
                    <td className="table-primary">{anomaly.system}</td>
                    <td>{anomaly.metric}</td>
                    <td>
                      <StatusBadge tone={severityTone[anomaly.severity]}>
                        {anomaly.severity}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={statusTone[anomaly.status]}>{anomaly.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <h2>Top Affected Services</h2>
            <Link to="/services">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <ul className="ops-service-list">
            {model.services.slice(0, 5).map((service) => (
              <li key={service.id}>
                <span className={`ops-service-icon status-${service.status.toLowerCase()}`} />
                <div>
                  <strong>{service.name}</strong>
                  <span>{service.activeAnomalies} anomalies</span>
                </div>
                <Sparkline values={service.spark ?? []} />
                <em>
                  ↑ {service.changePct ?? 0}%
                </em>
              </li>
            ))}
          </ul>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <h2>Recent Activity</h2>
            <Link to="/investigations">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <ul className="ops-activity">
            {model.activity.map((item) => (
              <li key={item.id}>
                <i className={`ops-activity-dot ops-activity-${item.tone}`} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <em>{item.time}</em>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
