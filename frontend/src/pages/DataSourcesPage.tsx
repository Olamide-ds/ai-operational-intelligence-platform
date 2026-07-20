import { useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  FileSpreadsheet,
  LoaderCircle,
  RadioTower,
  RotateCcw,
  Snowflake,
  Upload,
} from 'lucide-react'
import { ApiError, explainAnomaly, predictAnomalies } from '../api/client'
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

type ProcessingStage = 'idle' | 'validating' | 'detecting' | 'explaining' | 'complete'

const illustrativeConnectors = [
  { name: 'REST API', icon: Code2 },
  { name: 'PostgreSQL', icon: Database },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Kafka', icon: RadioTower },
]

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

    setErrorMessage('')
    const startedAt = Date.now()

    try {
      const { values, timestamps } = extractSeries(
        rows,
        metricColumn,
        timestampColumn || undefined,
      )

      setStage('detecting')
      const prediction = await predictAnomalies(values)
      const anomalyIndexes = prediction.anomaly.flatMap((flag, index) =>
        flag === 1 ? [index] : [],
      )

      let explanation
      if (anomalyIndexes.length > 0) {
        setStage('explaining')
        try {
          explanation = await explainAnomaly({
            metric: metricColumn,
            point_count: values.length,
            anomaly_count: anomalyIndexes.length,
            anomaly_indices: anomalyIndexes,
            anomaly_scores: anomalyIndexes.map((index) => prediction.anomaly_score[index]),
            warmup_points_dropped: prediction.warmup_points_dropped,
          })
        } catch {
          // Explanation is optional; valid anomaly results remain available.
        }
      }

      setLatestAnalysis(
        adaptAnalysisResponse(
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
        ),
      )
      setStage('complete')
    } catch (error) {
      setStage('idle')
      setErrorMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'The analysis could not be completed.',
      )
    }
  }

  const stageLabel = {
    idle: '',
    validating: 'Validating CSV…',
    detecting: 'Detecting anomalies…',
    explaining: 'Generating explanation…',
    complete: 'Analysis complete',
  }[stage]

  return (
    <div className="page">
      <PageHeader
        title="Data Sources"
        description="CSV import is implemented; the remaining connectors show production integration patterns."
      />

      <section className="panel csv-import-panel">
        <div className="panel-header">
          <div className="source-title">
            <FileSpreadsheet size={20} aria-hidden="true" />
            <div>
              <h2>CSV Import</h2>
              <p>CSV simulates data that production connectors would ingest automatically.</p>
            </div>
          </div>
          <StatusBadge tone="success">Implemented</StatusBadge>
        </div>

        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          tabIndex={-1}
          onChange={handleFileChange}
        />
        <button
          className="upload-zone upload-zone-compact"
          type="button"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
        >
          {stage === 'validating' ? (
            <LoaderCircle className="spin" size={20} />
          ) : (
            <Upload size={20} />
          )}
          <strong>{file ? file.name : 'Choose a CSV file'}</strong>
          <span>
            {rows.length > 0
              ? `${rows.length.toLocaleString()} observations`
              : `20–${MAX_OBSERVATIONS.toLocaleString()} rows · Max ${MAX_CSV_BYTES / 1024 / 1024} MB`}
          </span>
        </button>

        {numericColumns.length > 0 && (
          <div className="column-grid">
            <label className="field-group" htmlFor="metric-column">
              <span>Metric column</span>
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
            </label>
            <label className="field-group" htmlFor="timestamp-column">
              <span>Timestamp column</span>
              <select
                id="timestamp-column"
                value={timestampColumn}
                disabled={isProcessing}
                onChange={(event) => setTimestampColumn(event.target.value)}
              >
                <option value="">Observation number</option>
                {timestampColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {errorMessage && (
          <div className="form-message form-message-error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => (metricColumn ? void runAnalysis() : inputRef.current?.click())}
            >
              <RotateCcw size={13} /> Retry
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="processing-state" role="status" aria-live="polite">
            <LoaderCircle className="spin" size={17} />
            <strong>{stageLabel}</strong>
          </div>
        )}

        <div className="form-actions simple-form-actions">
          <button
            className="button button-primary"
            type="button"
            disabled={!file || !metricColumn || isProcessing}
            onClick={() => void runAnalysis()}
          >
            Analyze data <ArrowRight size={16} />
          </button>
          {latestAnalysis && stage === 'complete' && (
            <span className="inline-success" role="status">
              <CheckCircle2 size={15} />
              {latestAnalysis.anomalyCount} anomalies in{' '}
              {latestAnalysis.pointCount.toLocaleString()} observations
            </span>
          )}
        </div>
      </section>

      <section>
        <div className="simple-section-heading">
          <h2>Illustrative integrations</h2>
          <span>Not connected</span>
        </div>
        <div className="source-list">
          {illustrativeConnectors.map(({ name, icon: Icon }) => (
            <article key={name}>
              <Icon size={18} aria-hidden="true" />
              <strong>{name}</strong>
              <StatusBadge tone="neutral">Illustrative</StatusBadge>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
