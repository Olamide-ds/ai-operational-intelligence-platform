import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AnalysisProvider } from './context/AnalysisProvider'
import { AIInsightsPage } from './pages/AIInsightsPage'
import { AnomaliesPage } from './pages/AnomaliesPage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { DataSourcesPage } from './pages/DataSourcesPage'
import { MonitoringPage } from './pages/MonitoringPage'
import { OverviewPage } from './pages/OverviewPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <AnalysisProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/upload" element={<DataSourcesPage />} />
          <Route path="/data-sources" element={<Navigate to="/upload" replace />} />
          <Route path="/services" element={<MonitoringPage />} />
          <Route path="/monitoring" element={<Navigate to="/services" replace />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/investigations" element={<AIInsightsPage />} />
          <Route path="/ai-insights" element={<Navigate to="/investigations" replace />} />
          <Route path="/reports" element={<ArchitecturePage />} />
          <Route path="/architecture" element={<Navigate to="/reports" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </AnalysisProvider>
  )
}
