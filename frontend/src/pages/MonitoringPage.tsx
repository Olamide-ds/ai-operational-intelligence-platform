import { PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import { buildDashboardModel } from '../data/dashboard'

const statusTone = {
  Healthy: 'success',
  Watch: 'warning',
  Degraded: 'critical',
} as const

export function MonitoringPage() {
  const { latestAnalysis } = useAnalysis()
  const { services } = buildDashboardModel(latestAnalysis)

  return (
    <div className="page">
      <PageHeader
        title="Services"
        description="Where detected anomalies are landing, and which systems need attention first."
      />

      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Monitored services</caption>
            <thead>
              <tr>
                <th scope="col">System</th>
                <th scope="col">Status</th>
                <th scope="col">Anomalies</th>
                <th scope="col">Last updated</th>
                <th scope="col">Current metric</th>
              </tr>
            </thead>
            <tbody>
              {services.map((system) => (
                <tr key={system.id}>
                  <td className="table-primary">{system.name}</td>
                  <td>
                    <StatusBadge tone={statusTone[system.status]}>{system.status}</StatusBadge>
                  </td>
                  <td>{system.activeAnomalies}</td>
                  <td>{system.lastUpdated}</td>
                  <td>
                    <span className="metric-reading">{system.latestReading}</span>
                    <span className="metric-name">{system.metric}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
