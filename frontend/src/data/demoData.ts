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

export const requestVolume: TrendPoint[] = [
  { label: '12 AM', value: 16200 },
  { label: '4 AM', value: 12800 },
  { label: '8 AM', value: 21400 },
  { label: '12 PM', value: 26800 },
  { label: '4 PM', value: 38600, anomalies: 1, anomalyValue: 38600 },
  { label: '8 PM', value: 24100 },
]

export const anomalies: AnomalyRecord[] = [
  {
    id: 'AN-1048',
    system: 'payment-service',
    metric: 'latency',
    severity: 'High',
    status: 'Investigating',
    observedValue: '518 ms',
    baselineValue: '243 ms',
    score: -0.184,
    detectedAt: '2026-09-16T16:32:00-05:00',
    relativeTime: '4:32 PM',
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
    system: 'auth-service',
    metric: 'error_rate',
    severity: 'High',
    status: 'Open',
    observedValue: '4.8%',
    baselineValue: '0.9%',
    score: -0.129,
    detectedAt: '2026-09-16T14:17:00-05:00',
    relativeTime: '2:17 PM',
    potentialImpact: 'Sign-in and token refresh failures may block downstream customer actions.',
    explanation:
      'Error rate increased sharply while request volume stayed near baseline. Dependency timeouts or a recent auth config change should be investigated.',
    recommendedActions: [
      'Inspect identity-provider error codes.',
      'Check token store latency and saturation.',
      'Compare error rate by client and region.',
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
    system: 'api-gateway',
    metric: 'request_volume',
    severity: 'Medium',
    status: 'Monitoring',
    observedValue: '38.6k / hr',
    baselineValue: '21.4k / hr',
    score: -0.086,
    detectedAt: '2026-09-16T11:03:00-05:00',
    relativeTime: '11:03 AM',
    potentialImpact: 'Elevated gateway traffic can amplify latency in already stressed services.',
    explanation:
      'Request volume moved outside its recent operating range. Confirm whether this is an expected campaign spike or retry amplification.',
    recommendedActions: [
      'Segment traffic by route and client.',
      'Check retry storms from payment-service.',
    ],
    series: orderSeries.map((point) => ({ ...point, value: point.value * 8, baseline: 21.4 })),
    model: {
      algorithm: 'Isolation Forest',
      signal: 'Univariate rolling statistics',
      warmupWindow: '19 points',
      source: 'Demo operational telemetry',
    },
  },
  {
    id: 'AN-1045',
    system: 'user-service',
    metric: 'memory_usage',
    severity: 'Medium',
    status: 'Resolved',
    observedValue: '86%',
    baselineValue: '62%',
    score: -0.041,
    detectedAt: '2026-09-16T09:48:00-05:00',
    relativeTime: '9:48 AM',
    potentialImpact: 'Elevated memory can increase GC pauses and profile-page latency.',
    explanation:
      'Memory usage briefly exceeded its normal range and returned to baseline after a process recycle.',
    recommendedActions: ['Continue monitoring heap growth after the next deploy.'],
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
  {
    id: 'AN-1044',
    system: 'notification-service',
    metric: 'latency',
    severity: 'Low',
    status: 'Resolved',
    observedValue: '940 ms',
    baselineValue: '410 ms',
    score: -0.028,
    detectedAt: '2026-09-16T06:21:00-05:00',
    relativeTime: '6:21 AM',
    potentialImpact: 'Notification delay can slow order and security emails during off-peak hours.',
    explanation: 'A short-lived latency spike resolved without a matching error-rate increase.',
    recommendedActions: ['Keep the provider timeout dashboard open through the next send window.'],
    series: paymentSeries,
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
    name: 'payment-service',
    status: 'Degraded',
    metric: 'latency',
    latestReading: '518 ms',
    baseline: '243 ms',
    lastUpdated: '3h ago',
    activeAnomalies: 347,
    changePct: 320,
    spark: [12, 14, 13, 18, 22, 48, 41, 28],
  },
  {
    id: 'auth',
    name: 'auth-service',
    status: 'Watch',
    metric: 'error_rate',
    latestReading: '4.8%',
    baseline: '0.9%',
    lastUpdated: '4h ago',
    activeAnomalies: 128,
    changePct: 86,
    spark: [8, 9, 8, 11, 10, 16, 15, 12],
  },
  {
    id: 'gateway',
    name: 'api-gateway',
    status: 'Watch',
    metric: 'request_volume',
    latestReading: '38.6k',
    baseline: '21.4k',
    lastUpdated: '5h ago',
    activeAnomalies: 89,
    changePct: 24,
    spark: [18, 17, 19, 21, 20, 24, 23, 22],
  },
  {
    id: 'users',
    name: 'user-service',
    status: 'Healthy',
    metric: 'memory_usage',
    latestReading: '62%',
    baseline: '61%',
    lastUpdated: '6h ago',
    activeAnomalies: 52,
    changePct: 18,
    spark: [20, 21, 19, 22, 24, 23, 21, 20],
  },
  {
    id: 'notify',
    name: 'notification-service',
    status: 'Healthy',
    metric: 'latency',
    latestReading: '410 ms',
    baseline: '405 ms',
    lastUpdated: '6h ago',
    activeAnomalies: 41,
    changePct: 12,
    spark: [14, 13, 15, 14, 16, 15, 14, 13],
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
    system: 'payment-service',
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
