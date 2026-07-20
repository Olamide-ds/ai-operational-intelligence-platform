import { ArrowDown } from 'lucide-react'
import { PageHeader, StatusBadge } from '../components/ui'

const currentPrototype = [
  'CSV',
  'React',
  'FastAPI',
  'Isolation Forest',
  'LLM Explanation (optional)',
  'Dashboard',
]

const production = ['Enterprise Systems', 'Ingestion Layer', 'Inference', 'Dashboard']

const productionConsiderations = [
  'Authentication',
  'RBAC',
  'Monitoring',
  'Drift Detection',
  'Audit Logs',
]

function ArchitectureFlow({
  steps,
  label,
}: {
  steps: string[]
  label: string
}) {
  return (
    <ol className="simple-architecture-flow" aria-label={label}>
      {steps.map((step, index) => (
        <li key={step}>
          <span>{step}</span>
          {index < steps.length - 1 && <ArrowDown size={18} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  )
}

export function ArchitecturePage() {
  return (
    <div className="page">
      <PageHeader
        title="Architecture"
        description="The implemented prototype and its simplest credible production evolution."
      />

      <div className="architecture-diagrams">
        <section className="panel architecture-diagram">
          <div className="panel-header">
            <h2>Current Prototype</h2>
            <StatusBadge tone="success">Implemented</StatusBadge>
          </div>
          <ArchitectureFlow steps={currentPrototype} label="Current prototype architecture" />
        </section>

        <section className="panel architecture-diagram">
          <div className="panel-header">
            <h2>Production</h2>
            <StatusBadge tone="neutral">Conceptual</StatusBadge>
          </div>
          <ArchitectureFlow steps={production} label="Conceptual production architecture" />
        </section>
      </div>

      <section className="production-considerations">
        <h2>Production Considerations</h2>
        <ul>
          {productionConsiderations.map((consideration) => (
            <li key={consideration}>{consideration}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
