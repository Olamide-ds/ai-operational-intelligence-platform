import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AnalysisProvider } from './context/AnalysisProvider'

const OverviewPage = lazy(() =>
  import('./pages/OverviewPage').then((module) => ({ default: module.OverviewPage })),
)
const DataSourcesPage = lazy(() =>
  import('./pages/DataSourcesPage').then((module) => ({ default: module.DataSourcesPage })),
)
const MonitoringPage = lazy(() =>
  import('./pages/MonitoringPage').then((module) => ({ default: module.MonitoringPage })),
)
const AnomaliesPage = lazy(() =>
  import('./pages/AnomaliesPage').then((module) => ({ default: module.AnomaliesPage })),
)
const AIInsightsPage = lazy(() =>
  import('./pages/AIInsightsPage').then((module) => ({ default: module.AIInsightsPage })),
)
const ArchitecturePage = lazy(() =>
  import('./pages/ArchitecturePage').then((module) => ({ default: module.ArchitecturePage })),
)

export default function App() {
  return (
    <AnalysisProvider>
      <AppShell>
        <Suspense
          fallback={
            <div className="route-loading" role="status" aria-live="polite" aria-busy="true">
              Loading workspace…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/anomalies" element={<AnomaliesPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </AnalysisProvider>
  )
}
