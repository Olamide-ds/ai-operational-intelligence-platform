import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Activity,
  BrainCircuit,
  ChevronRight,
  Database,
  LayoutDashboard,
  Menu,
  Network,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const navigation = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Data Sources', to: '/data-sources', icon: Database },
  { label: 'Monitoring', to: '/monitoring', icon: Activity },
  { label: 'Anomalies', to: '/anomalies', icon: TriangleAlert },
  { label: 'AI Insights', to: '/ai-insights', icon: BrainCircuit },
  { label: 'Architecture', to: '/architecture', icon: Network },
]

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef('')
  const location = useLocation()
  const currentPage = navigation.find((item) => item.to === location.pathname)?.label ?? 'Overview'

  useEffect(() => {
    if (previousPath.current && previousPath.current !== location.pathname) {
      mainRef.current?.focus()
    }
    previousPath.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const menuButton = menuButtonRef.current
    closeButtonRef.current?.focus()
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
      if (event.key === 'Tab') {
        const focusable = sidebarRef.current
          ? [
              ...sidebarRef.current.querySelectorAll<HTMLElement>(
                'button, a, [tabindex]:not([tabindex="-1"])',
              ),
            ]
          : []
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
      menuButton?.focus()
    }
  }, [mobileOpen])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id="primary-navigation"
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        aria-label="Product navigation"
      >
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Activity size={19} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">Operational Intelligence</div>
            <span className="prototype-badge">Prototype</span>
          </div>
          <button
            ref={closeButtonRef}
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight className="nav-chevron" size={15} />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="environment-card">
            <div className="environment-icon">
              <ShieldCheck size={17} />
            </div>
            <div>
              <strong>Demo workspace</strong>
              <span>Prototype environment</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={menuButtonRef}
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-controls="primary-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <span className="topbar-context">Operational Intelligence</span>
              <strong>{currentPage}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="avatar" role="img" aria-label="Prototype workspace">
              OD
            </div>
          </div>
        </header>
        <main id="main-content" ref={mainRef} className="main-content" tabIndex={-1}>
          {children}
          <footer className="prototype-disclaimer">
            This prototype uses CSV import to simulate operational data ingestion. Production
            deployments would require secure integrations, customer-specific baselines,
            monitoring, access controls, and model validation.
          </footer>
        </main>
      </div>
    </div>
  )
}
