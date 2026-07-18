import type { ReactNode } from 'react'

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'neutral' | 'info'
}) {
  return <span className={`status-badge status-${tone}`}>{children}</span>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

export function DemoNotice({
  children,
  label = 'Prototype context',
}: {
  children?: ReactNode
  label?: string
}) {
  return (
    <div className="demo-notice" role="note">
      <strong>{label}</strong>
      <span>{children ?? 'Representative operational data for product demonstration.'}</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
