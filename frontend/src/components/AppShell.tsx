import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  Bell,
  FileBarChart,
  FolderUp,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Shield,
  TriangleAlert,
  Waypoints,
  X,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/useAnalysis'
import { buildDashboardModel } from '../data/dashboard'

const navigation = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Upload Data', to: '/upload', icon: FolderUp },
  { label: 'Anomalies', to: '/anomalies', icon: TriangleAlert, badge: true },
  { label: 'Investigations', to: '/investigations', icon: Shield },
  { label: 'Services', to: '/services', icon: Waypoints },
  { label: 'Reports', to: '/reports', icon: FileBarChart },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef('')
  const location = useLocation()
  const navigate = useNavigate()
  const { latestAnalysis } = useAnalysis()
  const dashboard = buildDashboardModel(latestAnalysis)
  const anomalyCount = dashboard.mode === 'demo' ? 3 : latestAnalysis?.anomalyCount ?? 0

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

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const next = query.trim()
    navigate(next ? `/anomalies?q=${encodeURIComponent(next)}` : '/anomalies')
  }

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
            <Activity size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-name">OpsSignal</div>
            <span className="brand-subtitle">Operational Intelligence</span>
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
          {navigation.map(({ label, to, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge && anomalyCount > 0 ? (
                <span className="nav-badge">{anomalyCount > 9 ? '9+' : anomalyCount}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <span className="user-avatar" aria-hidden="true">
              OB
            </span>
            <div>
              <strong>Ola Bankole</strong>
              <span>Engineering</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
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
          <div className="topbar-actions ops-topbar-actions">
            <label className="range-select">
              <span className="visually-hidden">Time range</span>
              <select defaultValue="24h" aria-label="Time range">
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
            </label>
            <form className="ops-search" onSubmit={handleSearch}>
              <Search size={16} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services, metrics, or incidents..."
                aria-label="Search services, metrics, or incidents"
              />
            </form>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={17} />
              {anomalyCount > 0 && <span className="notification-dot" />}
            </button>
          </div>
        </header>
        <main id="main-content" ref={mainRef} className="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
