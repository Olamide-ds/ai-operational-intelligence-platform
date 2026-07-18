import {
  Activity,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  FileCheck2,
  Gauge,
  History,
  KeyRound,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Network,
  Radar,
  Scale,
  ServerCog,
  ShieldCheck,
  Timer,
  TriangleAlert,
  Users,
  Workflow,
} from 'lucide-react'
import { PageHeader, StatusBadge } from '../components/ui'

const currentDataPath = [
  {
    title: 'CSV upload',
    detail: 'Browser validates the file and extracts one ordered numeric metric.',
    icon: Database,
    meta: 'React frontend',
  },
  {
    title: 'FastAPI endpoint',
    detail: 'POST /anomaly/predict accepts a JSON array of numeric values.',
    icon: ServerCog,
    meta: 'Synchronous API',
  },
  {
    title: 'Validation & preprocessing',
    detail: 'Pydantic validates numeric input, then the backend builds rolling features.',
    icon: FileCheck2,
    meta: '5- and 20-point windows',
  },
  {
    title: 'Isolation Forest',
    detail: 'The committed model artifact scores eligible observations.',
    icon: Gauge,
    meta: 'Inference only',
  },
]

const currentProductPath = [
  {
    title: 'Anomaly results',
    detail: 'Aligned anomaly flags and decision scores are normalized for the interface.',
    icon: Activity,
    meta: 'First 19 points are warmup',
  },
  {
    title: 'AI explanation',
    detail: 'Optional TF-IDF runbook retrieval and OpenAI structured explanation.',
    icon: BrainCircuit,
    meta: 'Requires server-side API key',
  },
  {
    title: 'React dashboard',
    detail: 'Session-scoped overview, charts, anomaly detail, and investigation context.',
    icon: Layers3,
    meta: 'Browser session storage',
  },
]

const productionIngestionPath = [
  {
    title: 'Customer systems',
    detail: 'Potential production source categories.',
    icon: Network,
    items: ['REST APIs', 'PostgreSQL', 'Snowflake', 'Cloud monitoring', 'Event streams'],
  },
  {
    title: 'Secure ingestion',
    detail: 'Authenticated connectors, scheduling, checkpoints, and backpressure controls.',
    icon: LockKeyhole,
  },
  {
    title: 'Schema validation',
    detail: 'Contracts, data-quality rules, timestamps, units, and normalization.',
    icon: FileCheck2,
  },
  {
    title: 'Batch or streaming',
    detail: 'Workload-specific processing with durable state and replay support.',
    icon: Workflow,
  },
]

const productionIntelligencePath = [
  {
    title: 'Feature pipeline',
    detail: 'Versioned, reproducible features aligned between training and inference.',
    icon: Layers3,
  },
  {
    title: 'Model inference service',
    detail: 'Versioned models, controlled rollout, autoscaling, and stable contracts.',
    icon: Gauge,
  },
  {
    title: 'Alert prioritization',
    detail: 'Customer-calibrated severity, suppression, correlation, and routing.',
    icon: TriangleAlert,
  },
  {
    title: 'Explanation service',
    detail: 'Governed retrieval, source attribution, evaluation, and safe degradation.',
    icon: BrainCircuit,
  },
  {
    title: 'Product delivery',
    detail: 'Dashboard, notifications, case workflows, and downstream APIs.',
    icon: BellRing,
  },
]

const productionConsiderations = [
  {
    title: 'Authentication & access',
    detail: 'SSO, service identities, and role-based authorization.',
    icon: KeyRound,
  },
  {
    title: 'Encryption & secrets',
    detail: 'Encryption in transit and at rest with managed secret rotation.',
    icon: ShieldCheck,
  },
  {
    title: 'Tenant isolation',
    detail: 'Separate customer data, configuration, compute, and access boundaries.',
    icon: Users,
  },
  {
    title: 'Data retention',
    detail: 'Customer-specific retention, deletion, residency, and archival policies.',
    icon: History,
  },
  {
    title: 'Observability',
    detail: 'Service metrics, traces, logs, SLOs, and actionable operational alerts.',
    icon: Radar,
  },
  {
    title: 'Model performance',
    detail: 'Precision-oriented review, false-positive analysis, and segment evaluation.',
    icon: Activity,
  },
  {
    title: 'Drift monitoring',
    detail: 'Track feature, score, and operating-distribution changes over time.',
    icon: Gauge,
  },
  {
    title: 'Human feedback',
    detail: 'Capture triage outcomes and use them to improve thresholds and models.',
    icon: MessageSquareText,
  },
  {
    title: 'Auditability',
    detail: 'Versioned inputs, model decisions, explanations, and user actions.',
    icon: FileCheck2,
  },
  {
    title: 'Failure handling',
    detail: 'Retries, dead-letter paths, idempotency, fallbacks, and replay.',
    icon: TriangleAlert,
  },
  {
    title: 'Cost & latency',
    detail: 'Budgets for compute, storage, model inference, and LLM enrichment.',
    icon: Timer,
  },
  {
    title: 'Batch vs. streaming',
    detail: 'Choose freshness and complexity based on operational response needs.',
    icon: Scale,
  },
]

type PipelineStep = {
  title: string
  detail: string
  icon: typeof Code2
  meta?: string
  items?: string[]
}

function Pipeline({
  steps,
  status,
  label,
}: {
  steps: PipelineStep[]
  status: 'implemented' | 'future'
  label: string
}) {
  return (
    <ol className={`architecture-pipeline pipeline-${status}`} aria-label={label}>
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <li className="pipeline-step" key={step.title}>
            <div className="pipeline-step-header">
              <span className="pipeline-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="pipeline-icon" aria-hidden="true">
                <Icon size={19} />
              </div>
            </div>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
            {step.items && (
              <ul className="pipeline-source-list" aria-label={`${step.title} examples`}>
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {step.meta && <span className="pipeline-meta">{step.meta}</span>}
          </li>
        )
      })}
    </ol>
  )
}

export function ArchitecturePage() {
  return (
    <div className="page architecture-page">
      <PageHeader
        eyebrow="Technical deep dive"
        title="Architecture"
        description="A clear separation between the working prototype, a plausible production evolution, and the controls required to operate it responsibly."
      />

      <nav className="architecture-jump-nav" aria-label="Architecture sections">
        <a href="#current-prototype">1. Current prototype</a>
        <a href="#production-evolution">2. Production evolution</a>
        <a href="#production-considerations">3. Production considerations</a>
      </nav>

      <section id="current-prototype" className="architecture-section">
        <div className="architecture-section-heading">
          <div>
            <span className="section-index">01</span>
            <p className="eyebrow">Implemented now</p>
            <h2>Current prototype</h2>
            <p>
              The working path is a synchronous, single-series workflow. CSV parsing happens in
              the browser; the backend receives numeric JSON rather than the file itself.
            </p>
          </div>
          <StatusBadge tone="success">Implemented</StatusBadge>
        </div>

        <div className="architecture-lane">
          <div className="lane-label">Detection path</div>
          <Pipeline
            steps={currentDataPath}
            status="implemented"
            label="Current prototype detection path"
          />
        </div>
        <div className="pipeline-turn" aria-hidden="true">
          <span>then</span>
        </div>
        <div className="architecture-lane">
          <div className="lane-label">Product path</div>
          <Pipeline
            steps={currentProductPath}
            status="implemented"
            label="Current prototype product path"
          />
        </div>

        <div className="architecture-facts" role="note">
          <div>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Model artifacts and rolling feature logic are existing backend capabilities.</span>
          </div>
          <div>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>AI explanation is optional and fails independently of anomaly detection.</span>
          </div>
          <div>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>No database, queue, authentication, or durable anomaly history exists.</span>
          </div>
        </div>
      </section>

      <section id="production-evolution" className="architecture-section">
        <div className="architecture-section-heading">
          <div>
            <span className="section-index">02</span>
            <p className="eyebrow">Conceptual target state</p>
            <h2>Production evolution</h2>
            <p>
              A plausible evolution separates ingestion, processing, inference, explanation, and
              delivery so each can scale and fail independently.
            </p>
          </div>
          <StatusBadge tone="warning">Not implemented</StatusBadge>
        </div>

        <div className="future-boundary" role="note">
          <Cloud size={18} aria-hidden="true" />
          <p>
            Everything in this section is an architectural direction, not a connected or deployed
            capability.
          </p>
        </div>

        <div className="architecture-lane">
          <div className="lane-label">Sources & ingestion</div>
          <Pipeline
            steps={productionIngestionPath}
            status="future"
            label="Conceptual production ingestion path"
          />
        </div>
        <div className="pipeline-turn" aria-hidden="true">
          <span>then</span>
        </div>
        <div className="architecture-lane">
          <div className="lane-label">Intelligence & delivery</div>
          <Pipeline
            steps={productionIntelligencePath}
            status="future"
            label="Conceptual production intelligence and delivery path"
          />
        </div>
      </section>

      <section id="production-considerations" className="architecture-section">
        <div className="architecture-section-heading">
          <div>
            <span className="section-index">03</span>
            <p className="eyebrow">Enterprise requirements</p>
            <h2>Production considerations</h2>
            <p>
              These controls and operating practices would be required before customer deployment.
              None are represented as complete in the current prototype.
            </p>
          </div>
          <StatusBadge tone="warning">Future requirements</StatusBadge>
        </div>

        <div className="considerations-grid">
          {productionConsiderations.map((consideration) => {
            const Icon = consideration.icon
            return (
              <article className="consideration-card" key={consideration.title}>
                <div className="consideration-icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <div>
                  <h3>{consideration.title}</h3>
                  <p>{consideration.detail}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
