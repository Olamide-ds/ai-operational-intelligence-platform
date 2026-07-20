import Papa from 'papaparse'

export const MAX_CSV_BYTES = 2 * 1024 * 1024
export const MAX_OBSERVATIONS = 25_000
export const MIN_OBSERVATIONS = 20

export type CsvRow = Record<string, string>

export interface ParsedCsv {
  rows: CsvRow[]
  numericColumns: string[]
  timestampColumns: string[]
}

export class CsvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CsvValidationError'
  }
}

export function validateFileMetadata(file: Pick<File, 'name' | 'size' | 'type'>): void {
  const hasCsvExtension = file.name.toLowerCase().endsWith('.csv')
  const allowedMimeTypes = ['', 'text/csv', 'application/csv', 'application/vnd.ms-excel']

  if (!hasCsvExtension || !allowedMimeTypes.includes(file.type.toLowerCase())) {
    throw new CsvValidationError('Choose a CSV file with a .csv extension.')
  }
  if (file.size === 0) {
    throw new CsvValidationError('The selected CSV is empty.')
  }
  if (file.size > MAX_CSV_BYTES) {
    throw new CsvValidationError('The CSV exceeds the 2 MB prototype upload limit.')
  }
}

function isNumericValue(value: string | undefined): boolean {
  if (value === undefined || value.trim() === '') return false
  return Number.isFinite(Number(value))
}

export function inspectRows(rows: CsvRow[], fields: string[]): ParsedCsv {
  if (fields.length === 0) {
    throw new CsvValidationError('The CSV must include a header row.')
  }
  if (rows.length === 0) {
    throw new CsvValidationError('The CSV does not contain any data rows.')
  }
  if (rows.length > MAX_OBSERVATIONS) {
    throw new CsvValidationError(
      `The CSV contains more than ${MAX_OBSERVATIONS.toLocaleString()} observations.`,
    )
  }

  const sample = rows.slice(0, Math.min(rows.length, 50))
  const numericColumns = fields.filter((field) =>
    sample.every((row) => isNumericValue(row[field])),
  )
  if (numericColumns.length === 0) {
    throw new CsvValidationError(
      'A numeric metric column is required. Check for missing values or non-numeric text.',
    )
  }

  const timestampColumns = fields.filter((field) =>
    ['timestamp', 'time', 'date', 'datetime'].includes(field.trim().toLowerCase()),
  )

  return { rows, numericColumns, timestampColumns }
}

export function parseCsv(file: File): Promise<ParsedCsv> {
  validateFileMetadata(file)

  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: ({ data, meta, errors }) => {
        const structuralError = errors.find((error) => error.type !== 'FieldMismatch')
        if (structuralError) {
          reject(new CsvValidationError(`The CSV could not be parsed: ${structuralError.message}`))
          return
        }

        try {
          resolve(inspectRows(data, meta.fields ?? []))
        } catch (error) {
          reject(error)
        }
      },
      error: () => reject(new CsvValidationError('The CSV could not be read.')),
    })
  })
}

export function extractSeries(
  rows: CsvRow[],
  metricColumn: string,
  timestampColumn?: string,
): { values: number[]; timestamps?: string[] } {
  const values = rows.map((row, index) => {
    const rawValue = row[metricColumn]
    if (!isNumericValue(rawValue)) {
      throw new CsvValidationError(
        `Row ${index + 2} has a missing or non-numeric value in "${metricColumn}".`,
      )
    }
    return Number(rawValue)
  })

  if (values.length < MIN_OBSERVATIONS) {
    throw new CsvValidationError(
      `At least ${MIN_OBSERVATIONS} observations are required for model warmup.`,
    )
  }

  const timestamps = timestampColumn
    ? rows.map((row) => row[timestampColumn]?.trim() ?? '')
    : undefined

  return { values, timestamps }
}
