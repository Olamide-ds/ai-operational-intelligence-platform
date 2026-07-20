import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { AnalysisRun } from '../types'
import { AnalysisContext } from './analysisContext'

const SESSION_KEY = 'operational-intelligence.latest-analysis'

function restoreAnalysis(): AnalysisRun | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<AnalysisRun>
    return parsed.origin === 'uploaded' &&
      typeof parsed.fileName === 'string' &&
      typeof parsed.pointCount === 'number' &&
      Array.isArray(parsed.records) &&
      Array.isArray(parsed.series)
      ? (parsed as AnalysisRun)
      : null
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [latestAnalysis, setAnalysisState] = useState<AnalysisRun | null>(restoreAnalysis)
  const setLatestAnalysis = useCallback((analysis: AnalysisRun) => {
    setAnalysisState(analysis)
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(analysis))
    } catch {
      // The current analysis remains available in memory if browser storage is unavailable.
    }
  }, [])
  const value = useMemo(
    () => ({ latestAnalysis, setLatestAnalysis }),
    [latestAnalysis, setLatestAnalysis],
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}
