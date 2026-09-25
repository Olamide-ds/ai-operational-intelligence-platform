import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { predictAnomaliesLocally } from './isolationForest'

const fixture = JSON.parse(
  readFileSync(new URL('./isolationForest.fixture.json', import.meta.url), 'utf8'),
) as {
  values: number[]
  expected: {
    warmup_points_dropped: number
    anomaly: Array<number | null>
    anomaly_score: Array<number | null>
  }
}

describe('Isolation Forest local scorer', () => {
  it('matches the trained sklearn artifact on the reference series', () => {
    const result = predictAnomaliesLocally(fixture.values)

    expect(result.warmup_points_dropped).toBe(fixture.expected.warmup_points_dropped)
    expect(result.anomaly).toEqual(fixture.expected.anomaly)
    expect(result.anomaly_score).toHaveLength(fixture.expected.anomaly_score.length)

    for (const [index, score] of result.anomaly_score.entries()) {
      const expected = fixture.expected.anomaly_score[index]
      if (expected === null || score === null) {
        expect(score).toBe(expected)
        continue
      }
      expect(score).toBeCloseTo(expected, 12)
    }
  })
})
