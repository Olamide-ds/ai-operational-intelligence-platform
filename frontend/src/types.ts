export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type AnomalyStatus = 'New' | 'Investigating' | 'Resolved'
export type SystemStatus = 'Healthy' | 'Watch' | 'Degraded'
export type ConnectorStatus = 'Available' | 'Demo only' | 'Illustrative' | 'Planned'

export interface TrendPoint {
  label: string
  value: number
  baseline?: number
  anomalies?: number
  anomalyValue?: number
}

export interface AnomalyRecord {
  id: string
  origin?: 'demo' | 'uploaded'
  system: string
  metric: string
  severity: Severity
  status: AnomalyStatus
  observedValue: string
  baselineValue: string
  score: number
  detectedAt: string
  /** Raw uploaded CSV timestamp for this observation, when a timestamp column was selected. */
  sourceTimestamp?: string
  relativeTime: string
  observationIndex?: number
  potentialImpact: string
  explanation: string
  recommendedActions: string[]
  series: TrendPoint[]
  model: {
    algorithm: string
    signal: string
    warmupWindow: string
    source: string
  }
}

export interface MonitoredSystem {
  id: string
  name: string
  status: SystemStatus
  metric: string
  latestReading: string
  baseline: string
  lastUpdated: string
  activeAnomalies: number
}

export interface Insight {
  id: string
  priority: Severity
  title: string
  whatHappened: string
  whyItMatters: string
  investigation: string
  evidence: 'Strong signal' | 'Moderate signal' | 'Limited context'
  system: string
  anomalyId: string
}

export interface Connector {
  id: string
  name: string
  description: string
  status: ConnectorStatus
  category: string
}

export interface AnalysisRun {
  id: string
  origin: 'uploaded'
  fileName: string
  fileSize: number
  metric: string
  timestampColumn?: string
  pointCount: number
  anomalyCount: number
  completedAt: string
  durationMs: number
  warmupPointsDropped: number
  records: AnomalyRecord[]
  series: TrendPoint[]
  explanation?: AnalysisExplanation
  explanationUnavailable?: boolean
}

export interface AnalysisExplanation {
  rootCauses: string[]
  operationalImpact: string
  businessImpact: string
  recommendedActions: string[]
  assumptions: string[]
  uncertainty: string
  sources: string[]
}
