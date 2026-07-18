import type {
  AnomalyRecord,
  Connector,
  Insight,
  MonitoredSystem,
  TrendPoint,
} from '../types'

export const anomalyTrend: TrendPoint[] = [
  { label: 'Mon', value: 6, anomalies: 6 },
  { label: 'Tue', value: 9, anomalies: 9 },
  { label: 'Wed', value: 5, anomalies: 5 },
  { label: 'Thu', value: 12, anomalies: 12 },
  { label: 'Fri', value: 8, anomalies: 8 },
  { label: 'Sat', value: 4, anomalies: 4 },
  { label: 'Sun', value: 7, anomalies: 7 },
]

const paymentSeries: TrendPoint[] = [
  { label: '09:00', value: 242, baseline: 236 },
  { label: '09:10', value: 251, baseline: 238 },
  { label: '09:20', value: 246, baseline: 239 },
  { label: '09:30', value: 264, baseline: 241 },
  { label: '09:40', value: 518, baseline: 243 },
  { label: '09:50', value: 472, baseline: 244 },
  { label: '10:00', value: 281, baseline: 246 },
]

const orderSeries: TrendPoint[] = [
  { label: '09:00', value: 1.1, baseline: 1.2 },
  { label: '09:10', value: 1.3, baseline: 1.2 },
  { label: '09:20', value: 1.2, baseline: 1.2 },
  { label: '09:30', value: 1.5, baseline: 1.3 },
  { label: '09:40', value: 4.8, baseline: 1.3 },
  { label: '09:50', value: 3.9, baseline: 1.3 },
  { label: '10:00', value: 1.8, baseline: 1.4 },
]

export const anomalies: AnomalyRecord[] = [
  {
    id: 'AN-1048',
    system: 'Payments API',
    metric: 'p95 response latency',
    severity: 'Critical',
    status: 'New',
    observedValue: '518 ms',
    baselineValue: '243 ms',
    score: -0.184,
    detectedAt: '2026-07-18T15:42:00-05:00',
    relativeTime: '12 minutes ago',
    potentialImpact:
      'Checkout requests may time out, increasing payment abandonment and support contacts.',
    explanation:
      'Latency rose to more than twice the recent baseline while adjacent readings also remained elevated. This pattern may indicate downstream processor latency or connection-pool pressure.',
    recommendedActions: [
      'Compare payment processor latency by provider.',
      'Review connection-pool saturation and timeout rates.',
      'Correlate the spike with the latest deployment.',
    ],
    series: paymentSeries,
    model: {
      algorithm: 'Isolation Forest',
      signal: 'Univariate rolling statistics',
      warmupWindow: '19 points',
      source: 'Demo operational telemetry',
    },
  },
  {
    id: 'AN-1047',
    system: 'Order Processing',
    metric: 'Queue processing delay',
    severity: 'High',
    status: 'Investigating',
    observedValue: '4.8 min',
    baselineValue: '1.3 min',
    score: -0.129,
    detectedAt: '2026-07-18T15:21:00-05:00',
    relativeTime: '33 minutes ago',
    potentialImpact:
      'Order confirmations and downstream fulfillment handoffs may be delayed.',
    explanation:
      'Processing delay increased sharply while incoming order volume remained near its normal range. Worker availability or a dependency slowdown should be investigated.',
    recommendedActions: [
      'Inspect worker concurrency and retry volume.',
      'Check database lock and query latency.',
      'Validate downstream fulfillment acknowledgements.',
    ],
    series: orderSeries,
    model: {
      algorithm: 'Isolation Forest',
      signal: 'Univariate rolling statistics',
      warmupWindow: '19 points',
      source: 'Demo operational telemetry',
    },
  },
  {
    id: 'AN-1046',
    system: 'Inventory Service',
    metric: 'Stock sync failures',
    severity: 'Medium',
    status: 'New',
    observedValue: '3.7%',
    baselineValue: '0.8%',
    score: -0.086,
    detectedAt: '2026-07-18T14:48:00-05:00',
    relativeTime: '1 hour ago',
    potentialImpact:
      'Customers may briefly see stale availability for a subset of products.',
    explanation:
      'The failure rate moved outside its recent operating range. The impact appears contained but should be correlated with upstream catalog updates.',
    recommendedActions: [
      'Review failed synchronization batches.',
      'Compare failures by warehouse and product category.',
    ],
    series: orderSeries.map((point) => ({ ...point, value: point.value / 1.3, baseline: 0.8 })),
    model: {
      algorithm: 'Isolation Forest',
      signal: 'Univariate rolling statistics',
      warmupWindow: '19 points',
      source: 'Demo operational telemetry',
    },
  },
  {
    id: 'AN-1045',
    system: 'Customer Support Platform',
    metric: 'Ticket arrival rate',
    severity: 'Low',
    status: 'Resolved',
    observedValue: '86 / hr',
    baselineValue: '62 / hr',
    score: -0.041,
    detectedAt: '2026-07-18T13:34:00-05:00',
    relativeTime: '2 hours ago',
    potentialImpact: 'Support response times may increase if elevated volume persists.',
    explanation:
      'Ticket volume briefly exceeded its normal range and returned to baseline within two observation windows.',
    recommendedActions: ['Continue monitoring ticket categories for a recurring pattern.'],
    series: paymentSeries.map((point) => ({
      ...point,
      value: Math.round(point.value / 5.5),
      baseline: 62,
    })),
    model: {
      algorithm: 'Isolation Forest',
      signal: 'Univariate rolling statistics',
      warmupWindow: '19 points',
      source: 'Demo operational telemetry',
    },
  },
]

export const monitoredSystems: MonitoredSystem[] = [
  {
    id: 'payments',
    name: 'Payments API',
    status: 'Degraded',
    metric: 'p95 latency',
    latestReading: '518 ms',
    baseline: '243 ms',
    lastUpdated: '2 min ago',
    activeAnomalies: 1,
  },
  {
    id: 'orders',
    name: 'Order Processing',
    status: 'Watch',
    metric: 'Queue delay',
    latestReading: '4.8 min',
    baseline: '1.3 min',
    lastUpdated: '3 min ago',
    activeAnomalies: 1,
  },
  {
    id: 'inventory',
    name: 'Inventory Service',
    status: 'Watch',
    metric: 'Sync failures',
    latestReading: '3.7%',
    baseline: '0.8%',
    lastUpdated: '4 min ago',
    activeAnomalies: 1,
  },
  {
    id: 'fulfillment',
    name: 'Fulfillment Operations',
    status: 'Healthy',
    metric: 'Cycle time',
    latestReading: '18.4 min',
    baseline: '18.9 min',
    lastUpdated: '2 min ago',
    activeAnomalies: 0,
  },
  {
    id: 'support',
    name: 'Customer Support Platform',
    status: 'Healthy',
    metric: 'First response',
    latestReading: '11.2 min',
    baseline: '12.0 min',
    lastUpdated: '5 min ago',
    activeAnomalies: 0,
  },
]

export const connectors: Connector[] = [
  {
    id: 'csv',
    name: 'CSV Import',
    category: 'File import',
    status: 'Available',
    description: 'Upload ordered operational metrics and run anomaly analysis.',
  },
  {
    id: 'rest',
    name: 'REST API',
    category: 'Application data',
    status: 'Illustrative',
    description: 'Production connector pattern for application and partner APIs.',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Database',
    status: 'Illustrative',
    description: 'Scheduled extraction pattern for operational database metrics.',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    category: 'Data warehouse',
    status: 'Planned',
    description: 'Planned analytics warehouse ingestion path.',
  },
  {
    id: 'kafka',
    name: 'Kafka',
    category: 'Event streaming',
    status: 'Illustrative',
    description: 'Illustrative event-stream ingestion pattern for production.',
  },
  {
    id: 'cloudwatch',
    name: 'AWS CloudWatch',
    category: 'Monitoring',
    status: 'Demo only',
    description: 'Demo representation of cloud monitoring ingestion.',
  },
]

export const insights: Insight[] = [
  {
    id: 'IN-302',
    priority: 'Critical',
    title: 'Payment latency may affect checkout completion',
    whatHappened: 'Payments API p95 latency reached 518 ms, 113% above its rolling baseline.',
    whyItMatters:
      'Sustained latency at this level can increase timeouts and payment abandonment during peak traffic.',
    investigation:
      'Compare provider-specific latency, connection-pool saturation, and the most recent deployment window.',
    evidence: 'Strong signal',
    system: 'Payments API',
    anomalyId: 'AN-1048',
  },
  {
    id: 'IN-301',
    priority: 'High',
    title: 'Order queue delay is rising without matching demand',
    whatHappened: 'Processing delay rose to 4.8 minutes while order arrival volume remained stable.',
    whyItMatters:
      'The divergence suggests capacity or dependency pressure rather than a predictable traffic spike.',
    investigation:
      'Inspect worker utilization, retries, database locks, and fulfillment acknowledgement latency.',
    evidence: 'Moderate signal',
    system: 'Order Processing',
    anomalyId: 'AN-1047',
  },
  {
    id: 'IN-300',
    priority: 'Medium',
    title: 'Inventory synchronization errors are concentrated',
    whatHappened: 'Stock synchronization failures increased to 3.7% across recent batches.',
    whyItMatters:
      'Stale availability can lead to overselling or avoidable order substitutions.',
    investigation:
      'Segment failures by warehouse, supplier feed, and product category before escalating.',
    evidence: 'Limited context',
    system: 'Inventory Service',
    anomalyId: 'AN-1046',
  },
]

export const dashboardStats = {
  health: 'Needs attention',
  activeAnomalies: 3,
  criticalAlerts: 1,
  monitoredSystems: monitoredSystems.length,
  ingestionStatus: 'Operational',
  lastAnalysis: 'Today, 3:54 PM',
}
