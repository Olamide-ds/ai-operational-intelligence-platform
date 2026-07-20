import { PageHeader, StatusBadge } from '../components/ui'
import { monitoredSystems } from '../data/demoData'

const statusTone = {
  Healthy: 'success',
  Watch: 'warning',
  Degraded: 'critical',
} as const

export function MonitoringPage() {
  return (
    <div className="page">
      <PageHeader
        title="Monitoring"
        description="Representative system status and the metric currently being monitored."
      />

      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Representative monitored systems</caption>
            <thead>
              <tr>
                <th scope="col">System</th>
                <th scope="col">Status</th>
                <th scope="col">Last updated</th>
                <th scope="col">Current metric</th>
              </tr>
            </thead>
            <tbody>
              {monitoredSystems.map((system) => (
                <tr key={system.id}>
                  <td className="table-primary">{system.name}</td>
                  <td>
                    <StatusBadge tone={statusTone[system.status]}>{system.status}</StatusBadge>
                  </td>
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
