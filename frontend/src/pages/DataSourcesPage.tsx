import { useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  CloudCog,
  Code2,
  Database,
  ExternalLink,
  FileSpreadsheet,
  LoaderCircle,
  RadioTower,
  RotateCcw,
  Snowflake,
  Upload,
} from 'lucide-react'
import {
  API_DOCS_URL,
  ApiError,
  explainAnomaly,
  predictAnomalies,
} from '../api/client'
import { adaptAnalysisResponse } from '../api/anomalyAdapter'
import { PageHeader, StatusBadge } from '../components/ui'
import { useAnalysis } from '../context/useAnalysis'
import {
  MAX_CSV_BYTES,
  MAX_OBSERVATIONS,
  extractSeries,
  parseCsv,
  type CsvRow,
} from '../data/csv'
import { connectors } from '../data/demoData'
import type { ConnectorStatus } from '../types'

const connectorIcons = {
  csv: FileSpreadsheet,
  rest: Code2,
  postgres: Database,
  snowflake: Snowflake,
  kafka: RadioTower,
  cloudwatch: CloudCog,
}

const connectorTones: Record<
  ConnectorStatus,
  'success' | 'info' | 'neutral' | 'warning'
> = {
  Available: 'success',
  'Demo only': 'warning',
  Illustrative: 'info',
  Planned: 'neutral',
}

type ProcessingStage = 'idle' | 'validating' | 'detecting' | 'explaining' | 'complete'

export function DataSourcesPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { latestAnalysis, setLatestAnalysis } = useAnalysis()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<CsvRow[]>([])
  const [numericColumns, setNumericColumns] = useState<string[]>([])
  const [timestampColumns, setTimestampColumns] = useState<string[]>([])
  const [metricColumn, setMetricColumn] = useState('')
  const [timestampColumn, setTimestampColumn] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [stage, setStage] = useState<ProcessingStage>('idle')

  const isProcessing = ['validating', 'detecting', 'explaining'].includes(stage)

  function resetResultState() {
    setErrorMessage('')
    setStage('idle')
  }

  async function processSelectedFile(selectedFile: File) {
    setFile(selectedFile)
    setRows([])
    setNumericColumns([])
    setTimestampColumns([])
    setMetricColumn('')
    setTimestampColumn('')
    setErrorMessage('')
    setStage('validating')

    try {
      const parsed = await parseCsv(selectedFile)
      const preferredMetric =
        parsed.numericColumns.find((field) =>
          ['value', 'metric', 'reading'].includes(field.toLowerCase()),
        ) ?? parsed.numericColumns[0]

      setRows(parsed.rows)
      setNumericColumns(parsed.numericColumns)
      setTimestampColumns(parsed.timestampColumns)
      setMetricColumn(preferredMetric)
      setTimestampColumn(parsed.timestampColumns[0] ?? '')
      setStage('idle')
    } catch (error) {
      setStage('idle')
      setErrorMessage(
        error instanceof Error ? error.message : 'The selected CSV could not be validated.',
      )
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) void processSelectedFile(selectedFile)
    event.target.value = ''
  }

  async function runAnalysis() {
    if (!file || !metricColumn) return

    resetResultState()
    const startedAt = Date.now()

    try {
      const { values, timestamps } = extractSeries(
        rows,
        metricColumn,
        timestampColumn || undefined,
      )

      setStage('detecting')
      const prediction = await predictAnomalies(values)
      const anomalyCount = prediction.anomaly.filter((value) => value === 1).length

      let explanation
      if (anomalyCount > 0) {
        setStage('explaining')
        try {
          const anomalyIndexes = prediction.anomaly.flatMap((flag, index) =>
            flag === 1 ? [index] : [],
          )
          explanation = await explainAnomaly({
            metric: metricColumn,
            point_count: values.length,
            anomaly_count: anomalyCount,
            anomaly_indices: anomalyIndexes,
            anomaly_scores: anomalyIndexes.map((index) => prediction.anomaly_score[index]),
            warmup_points_dropped: prediction.warmup_points_dropped,
          })
        } catch {
          // Explanation is an optional enrichment. Valid ML output is still preserved and shown.
        }
      }

      const analysis = adaptAnalysisResponse(
        {
          fileName: file.name,
          fileSize: file.size,
          metric: metricColumn,
          values,
          timestamps,
          timestampColumn: timestampColumn || undefined,
          startedAt,
        },
        prediction,
        explanation,
      )
      setLatestAnalysis(analysis)
      setStage('complete')
    } catch (error) {
      setStage('idle')
      setErrorMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'The analysis could not be completed. Please try again.',
      )
    }
  }

  const stageLabel = {
    idle: '',
    validating: 'Validating file structure…',
    detecting: 'Analyzing operational data…',
    explaining: 'Preparing an optional explanation…',
    complete: 'Analysis complete',
  }[stage]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Ingestion"
        title="Data sources"
        description="Import an ordered operational metric and analyze it with the existing detection service."
        actions={
          <a
            className="button button-secondary"
            href={API_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="View API documentation in a new tab"
          >
            View API documentation <ExternalLink size={14} />
          </a>
        }
      />

      <div className="prototype-explainer">
        <Cloud size={20} />
        <p>
          For this prototype, CSV import simulates operational data that would be ingested through
          APIs, databases, scheduled pipelines, or event streams in production.
        </p>
      </div>

      <section className="csv-workspace">
        <div className="panel csv-import-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Available now</p>
              <h2>Analyze a CSV file</h2>
            </div>
            <StatusBadge tone="success">Available</StatusBadge>
          </div>
          <p id="csv-upload-description" className="section-copy">
            CSV parsing and column mapping happen in your browser. The original file is not
            uploaded; only the selected ordered numeric values are sent to the anomaly-detection
            service.
          </p>

          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept=".csv,text/csv"
            tabIndex={-1}
            aria-describedby="csv-upload-description"
            onChange={handleFileChange}
          />
          <button
            className="upload-zone"
            type="button"
            disabled={isProcessing}
            aria-describedby="csv-upload-description"
            onClick={() => inputRef.current?.click()}
          >
            <span className="upload-icon">
              {stage === 'validating' ? <LoaderCircle className="spin" size={22} /> : <Upload size={22} />}
            </span>
            <strong>{file ? file.name : 'Choose a CSV file'}</strong>
            <span>
              {rows.length > 0
                ? `${rows.length.toLocaleString()} ordered observations validated`
                : `CSV only · Maximum ${MAX_CSV_BYTES / 1024 / 1024} MB`}
            </span>
          </button>

          {numericColumns.length > 0 && (
            <div className="column-grid">
              <div className="field-group">
                <label htmlFor="metric-column">Numeric metric column · required</label>
                <select
                  id="metric-column"
                  value={metricColumn}
                  disabled={isProcessing}
                  onChange={(event) => setMetricColumn(event.target.value)}
                >
                  {numericColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
                <span>Submitted to the model in current row order</span>
              </div>
              <div className="field-group">
                <label htmlFor="timestamp-column">Timestamp column · optional</label>
                <select
                  id="timestamp-column"
                  value={timestampColumn}
                  disabled={isProcessing}
                  onChange={(event) => setTimestampColumn(event.target.value)}
                >
                  <option value="">Use observation number</option>
                  {timestampColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
                <span>Used for chart labels; not sent to the model</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="form-message form-message-error" role="alert">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() =>
                  metricColumn ? void runAnalysis() : inputRef.current?.click()
                }
                disabled={!file}
              >
                <RotateCcw size={13} /> {metricColumn ? 'Retry analysis' : 'Choose another file'}
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="processing-state" role="status" aria-live="polite">
              <LoaderCircle className="spin" size={17} />
              <div>
                <strong>{stageLabel}</strong>
                <span>Keep this page open while processing completes.</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              className="button button-primary"
              type="button"
              disabled={!file || !metricColumn || isProcessing}
              onClick={() => void runAnalysis()}
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="spin" size={16} /> Processing
                </>
              ) : (
                <>
                  Analyze operational data <ArrowRight size={16} />
                </>
              )}
            </button>
            <span>Numeric values are not written to browser logs.</span>
          </div>
        </div>

        <aside className="panel analysis-guide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">CSV requirements</p>
              <h2>Prepare your data</h2>
            </div>
          </div>
          <ul className="check-list">
            <li>
              <CheckCircle2 size={17} />
              CSV file with a header row
            </li>
            <li>
              <CheckCircle2 size={17} />
              At least 20 ordered numeric observations
            </li>
            <li>
              <CheckCircle2 size={17} />
              No missing values in the selected metric
            </li>
            <li>
              <CheckCircle2 size={17} />
              Maximum {MAX_OBSERVATIONS.toLocaleString()} rows and 2 MB
            </li>
          </ul>

          {latestAnalysis && stage === 'complete' && (
            <div
              className={`analysis-result ${
                latestAnalysis.anomalyCount === 0 ? 'analysis-result-neutral' : ''
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="result-heading">
                <CheckCircle2 size={18} />
                <strong>
                  {latestAnalysis.anomalyCount === 0
                    ? 'Analysis complete — no anomalies detected'
                    : 'Analysis complete'}
                </strong>
              </div>
              <dl>
                <div>
                  <dt>Points</dt>
                  <dd>{latestAnalysis.pointCount.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Anomalies</dt>
                  <dd>{latestAnalysis.anomalyCount}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{(latestAnalysis.durationMs / 1000).toFixed(1)} s</dd>
                </div>
              </dl>
              {latestAnalysis.explanationUnavailable && (
                <p className="result-note">
                  Detection succeeded, but AI explanation enrichment was unavailable.
                </p>
              )}
            </div>
          )}
        </aside>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Connector catalog</p>
            <h2>Production ingestion patterns</h2>
          </div>
        </div>
        <div className="connector-grid">
          {connectors.map((connector) => {
            const Icon = connectorIcons[connector.id as keyof typeof connectorIcons] ?? Database
            return (
              <article className="connector-card" key={connector.id}>
                <div className="connector-top">
                  <div className="connector-icon">
                    <Icon size={20} />
                  </div>
                  <StatusBadge tone={connectorTones[connector.status]}>
                    {connector.status}
                  </StatusBadge>
                </div>
                <h3>{connector.name}</h3>
                <span className="connector-category">{connector.category}</span>
                <p>{connector.description}</p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
