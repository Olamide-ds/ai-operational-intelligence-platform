import { describe, expect, it } from 'vitest'
import { adaptAnalysisResponse } from '../api/anomalyAdapter'
import { inspectRows, validateFileMetadata, type CsvRow } from './csv'

describe('CSV validation', () => {
  it('accepts a valid numeric value series', () => {
    const rows: CsvRow[] = Array.from({ length: 25 }, (_, index) => ({
      timestamp: `2026-07-18T10:${String(index).padStart(2, '0')}:00Z`,
      value: String(42 + index / 10),
    }))

    const parsed = inspectRows(rows, ['timestamp', 'value'])

    expect(parsed.numericColumns).toContain('value')
    expect(parsed.timestampColumns).toContain('timestamp')
    expect(parsed.rows).toHaveLength(25)
  })

  it('rejects a non-CSV upload', () => {
    expect(() =>
      validateFileMetadata({
        name: 'telemetry.json',
        size: 120,
        type: 'application/json',
      }),
    ).toThrow('Choose a CSV file')
  })

  it('rejects a dataset without a numeric metric column', () => {
    expect(() =>
      inspectRows(
        [
          { timestamp: '2026-07-18T10:00:00Z', value: 'unavailable' },
          { timestamp: '2026-07-18T10:01:00Z', value: 'unknown' },
        ],
        ['timestamp', 'value'],
      ),
    ).toThrow('A numeric metric column is required')
  })
})

describe('anomaly response adapter', () => {
  it('preserves a valid no-anomalies result without fabricating records', () => {
    const values = Array.from({ length: 25 }, () => 42)
    const analysis = adaptAnalysisResponse(
      {
        fileName: 'stable-series.csv',
        fileSize: 300,
        metric: 'value',
        values,
        startedAt: Date.now(),
      },
      {
        warmup_points_dropped: 19,
        anomaly: [...Array<null>(19).fill(null), ...Array<number>(6).fill(0)],
        anomaly_score: [...Array<null>(19).fill(null), ...Array<number>(6).fill(0.12)],
      },
    )

    expect(analysis.anomalyCount).toBe(0)
    expect(analysis.records).toEqual([])
    expect(analysis.series.length).toBeGreaterThan(0)
  })
})
