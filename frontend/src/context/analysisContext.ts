import { createContext } from 'react'
import type { AnalysisRun } from '../types'

export interface AnalysisContextValue {
  latestAnalysis: AnalysisRun | null
  setLatestAnalysis: (analysis: AnalysisRun) => void
}

export const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined)
