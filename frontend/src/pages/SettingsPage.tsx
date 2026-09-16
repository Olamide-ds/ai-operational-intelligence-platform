import { PageHeader } from '../components/ui'

export function SettingsPage() {
  return (
    <div className="page">
      <PageHeader
        title="Settings"
        description="Workspace defaults for this prototype. Detection still runs on uploaded CSV telemetry."
      />

      <div className="settings-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Profile</h2>
          </div>
          <dl className="settings-list">
            <div>
              <dt>Name</dt>
              <dd>Ola Bankole</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Engineering</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>America/Chicago</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Detection</h2>
          </div>
          <dl className="settings-list">
            <div>
              <dt>Model</dt>
              <dd>Isolation Forest</dd>
            </div>
            <div>
              <dt>Investigation</dt>
              <dd>Optional LLM explanation after anomalies are detected</dd>
            </div>
            <div>
              <dt>Data source</dt>
              <dd>CSV import is implemented; other connectors are illustrative</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
