import type { AnalysisRun, AnomalyRecord, MonitoredSystem, TrendPoint } from '../types'
import {
  anomalies as demoAnomalies,
  monitoredSystems as demoSystems,
  requestVolume as demoRequestVolume,
} from './demoData'

export interface DashboardKpi {
  label: string
  value: string
  delta: string
  tone: 'up' | 'down' | 'warn' | 'good'
}

export interface BreakdownSlice {
  label: string
  value: number
  color: string
}

export interface ActivityItem {
  id: string
  title: string
  detail: string
  time: string
  tone: 'critical' | 'info' | 'success' | 'neutral'
}

export interface DashboardModel {
  greeting: string
  subtitle: string
  kpis: DashboardKpi[]
  chart: TrendPoint[]
  chartTitle: string
  chartCaption: string
  annotation?: { label: string; text: string }
  breakdown: BreakdownSlice[]
  breakdownTotal: number
  anomalies: AnomalyRecord[]
  services: MonitoredSystem[]
  activity: ActivityItem[]
  assistantPrompt: string
  suggestedQuestions: string[]
  mode: 'demo' | 'uploaded'
}

const BREAKDOWN_COLORS = ['#5b8cff', '#7b5cff', '#3ecf8e', '#f0b429']

function greetingForNow(name = 'Ola'): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

function classifyMetric(metric: string): string {
  if (/latenc/i.test(metric)) return 'Latency spikes'
  if (/error|fail/i.test(metric)) return 'Error rate increase'
  if (/volume|request|traffic/i.test(metric)) return 'Traffic surge'
  if (/memory|cpu|util/i.test(metric)) return 'Memory usage'
  return 'Other signals'
}

function healthFromAnomalies(count: number, points: number): number {
  if (points === 0) return 100
  const ratio = count / points
  return Math.max(58, Math.round(100 - Math.min(0.42, ratio) * 100))
}

function formatDelta(current: number, previous: number, suffix = '%'): { text: string; tone: DashboardKpi['tone'] } {
  const diff = current - previous
  if (diff === 0) return { text: `0${suffix}`, tone: 'good' }
  const sign = diff > 0 ? '+' : ''
  return {
    text: `${sign}${diff}${suffix}`,
    tone: diff > 0 ? 'up' : 'down',
  }
}

export function buildDashboardModel(analysis: AnalysisRun | null): DashboardModel {
  if (!analysis) {
    return {
      greeting: greetingForNow(),
      subtitle: "Here's what's happening with your systems today.",
      kpis: [
        { label: 'Total Requests', value: '4.2M', delta: '12%', tone: 'good' },
        { label: 'Anomalies Detected', value: '17', delta: '183%', tone: 'warn' },
        { label: 'Affected Services', value: '3', delta: '+2', tone: 'up' },
        { label: 'System Health', value: '92%', delta: '5%', tone: 'good' },
      ],
      chart: demoRequestVolume,
      chartTitle: 'Request Volume & Anomalies',
      chartCaption: 'Requests',
      annotation: { label: '4 PM', text: 'Anomaly detected 4:32 PM · +320%' },
      breakdown: [
        { label: 'Latency spikes', value: 8, color: BREAKDOWN_COLORS[0] },
        { label: 'Error rate increase', value: 4, color: BREAKDOWN_COLORS[1] },
        { label: 'Traffic surge', value: 3, color: BREAKDOWN_COLORS[2] },
        { label: 'Memory usage', value: 2, color: BREAKDOWN_COLORS[3] },
      ],
      breakdownTotal: 17,
      anomalies: demoAnomalies,
      services: demoSystems,
      activity: [
        {
          id: 'a1',
          title: 'Anomaly detected',
          detail: 'High latency on payment-service',
          time: '3h ago',
          tone: 'critical',
        },
        {
          id: 'a2',
          title: 'Investigation started',
          detail: 'AI analysis in progress',
          time: '3h ago',
          tone: 'info',
        },
        {
          id: 'a3',
          title: 'Similar incident found',
          detail: 'Occurred 2 weeks ago',
          time: '4h ago',
          tone: 'neutral',
        },
        {
          id: 'a4',
          title: 'Issue resolved',
          detail: 'Memory usage normalized',
          time: '6h ago',
          tone: 'success',
        },
      ],
      assistantPrompt: 'Get AI-powered analysis and next steps for detected anomalies.',
      suggestedQuestions: [
        'Why did latency spike at 4:32 PM?',
        'Which services are affected?',
        'Show similar incidents',
        'What are the next steps?',
      ],
      mode: 'demo',
    }
  }

  const grouped = new Map<string, number>()
  for (const record of analysis.records) {
    const key = classifyMetric(record.metric)
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }
  const breakdown = [...grouped.entries()].map(([label, value], index) => ({
    label,
    value,
    color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
  }))
  if (breakdown.length === 0) {
    breakdown.push({ label: 'No anomalies', value: 1, color: '#cbd5e1' })
  }

  const uniqueSystems = [...new Set(analysis.records.map((record) => record.system))]
  const health = healthFromAnomalies(analysis.anomalyCount, analysis.pointCount)
  const anomalyDelta = formatDelta(analysis.anomalyCount, Math.max(0, analysis.anomalyCount - 2), '')

  const services: MonitoredSystem[] = uniqueSystems.length
    ? uniqueSystems.map((name, index) => {
        const related = analysis.records.filter((record) => record.system === name)
        const top = related[0]
        return {
          id: name,
          name,
          status: related.some((record) => record.severity === 'Critical' || record.severity === 'High')
            ? 'Degraded'
            : related.length
              ? 'Watch'
              : 'Healthy',
          metric: top?.metric ?? analysis.metric,
          latestReading: top?.observedValue ?? String(analysis.pointCount),
          baseline: top?.baselineValue ?? '—',
          lastUpdated: 'Just now',
          activeAnomalies: related.length,
          changePct: Math.round(Math.abs(top?.score ?? 0.1) * 1000),
          spark: analysis.series.slice(-8).map((point) => point.value * (1 - index * 0.04)),
        }
      })
    : [
        {
          id: 'uploaded',
          name: analysis.fileName,
          status: analysis.anomalyCount ? 'Watch' : 'Healthy',
          metric: analysis.metric,
          latestReading: `${analysis.pointCount} pts`,
          baseline: 'CSV import',
          lastUpdated: 'Just now',
          activeAnomalies: analysis.anomalyCount,
          spark: analysis.series.slice(-8).map((point) => point.value),
        },
      ]

  return {
    greeting: greetingForNow(),
    subtitle: `Latest analysis of ${analysis.fileName} · ${analysis.metric}.`,
    kpis: [
      {
        label: 'Observations',
        value: analysis.pointCount.toLocaleString(),
        delta: 'CSV',
        tone: 'good',
      },
      {
        label: 'Anomalies Detected',
        value: String(analysis.anomalyCount),
        delta: anomalyDelta.text,
        tone: analysis.anomalyCount ? 'warn' : 'good',
      },
      {
        label: 'Affected Services',
        value: String(Math.max(uniqueSystems.length, analysis.anomalyCount ? 1 : 0)),
        delta: uniqueSystems.length ? `+${uniqueSystems.length}` : '0',
        tone: uniqueSystems.length ? 'up' : 'good',
      },
      {
        label: 'System Health',
        value: `${health}%`,
        delta: analysis.anomalyCount ? 'Watch' : 'Stable',
        tone: health >= 90 ? 'good' : 'warn',
      },
    ],
    chart: analysis.series,
    chartTitle: analysis.metric,
    chartCaption: 'Observed',
    annotation: analysis.records[0]
      ? {
          label: analysis.records[0].relativeTime,
          text: `${analysis.records[0].metric} · ${analysis.records[0].observedValue}`,
        }
      : undefined,
    breakdown,
    breakdownTotal: analysis.anomalyCount || breakdown.reduce((sum, slice) => sum + slice.value, 0),
    anomalies: analysis.records,
    services,
    activity: analysis.records.slice(0, 4).map((record, index) => ({
      id: record.id,
      title: index === 0 ? 'Anomaly detected' : record.status === 'Resolved' ? 'Issue resolved' : 'Investigation started',
      detail: `${record.metric} on ${record.system}`,
      time: record.relativeTime,
      tone:
        record.severity === 'Critical' || record.severity === 'High'
          ? 'critical'
          : record.status === 'Resolved'
            ? 'success'
            : 'info',
    })),
    assistantPrompt: analysis.explanation
      ? analysis.explanation.recommendedActions[0] ??
        'Ask a follow-up about the latest Isolation Forest findings.'
      : 'Ask a question about the uploaded series, a detected anomaly, or next steps.',
    suggestedQuestions: [
      `What happened in ${analysis.metric}?`,
      'Which observations look most unusual?',
      'What should I investigate first?',
      'What is the likely impact?',
    ],
    mode: 'uploaded',
  }
}
