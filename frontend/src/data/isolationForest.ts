import model from './isolationForestModel.json'

const EULER_GAMMA = 0.5772156649015329

interface IsolationTree {
  feature: number[]
  threshold: number[]
  left: number[]
  right: number[]
  n: number[]
}

interface IsolationForestArtifact {
  features: string[]
  win_short: number
  win_long: number
  offset: number
  max_samples: number
  trees: IsolationTree[]
}

const artifact = model as IsolationForestArtifact

function averagePathLength(sampleCount: number): number {
  if (sampleCount <= 1) return 0
  if (sampleCount === 2) return 1
  return 2 * (Math.log(sampleCount - 1) + EULER_GAMMA) - (2 * (sampleCount - 1)) / sampleCount
}

function rollingMean(values: number[], window: number): Array<number | null> {
  return values.map((_, index) => {
    if (index < window - 1) return null
    let total = 0
    for (let cursor = index - window + 1; cursor <= index; cursor += 1) {
      total += values[cursor]
    }
    return total / window
  })
}

function rollingStd(values: number[], window: number): Array<number | null> {
  return values.map((_, index) => {
    if (index < window - 1) return null
    const start = index - window + 1
    let total = 0
    for (let cursor = start; cursor <= index; cursor += 1) {
      total += values[cursor]
    }
    const mean = total / window
    let squared = 0
    for (let cursor = start; cursor <= index; cursor += 1) {
      const delta = values[cursor] - mean
      squared += delta * delta
    }
    return Math.sqrt(squared / (window - 1))
  })
}

function treeContribution(tree: IsolationTree, features: number[]): number {
  let node = 0
  let nodesOnPath = 0
  while (true) {
    nodesOnPath += 1
    const featureIndex = tree.feature[node]
    if (featureIndex < 0) {
      return nodesOnPath + averagePathLength(tree.n[node]) - 1
    }
    node = features[featureIndex] <= tree.threshold[node] ? tree.left[node] : tree.right[node]
  }
}

function scoreRows(rows: number[][]): { scores: number[]; flags: Array<0 | 1> } {
  const treeCount = artifact.trees.length
  const normalizer = treeCount * averagePathLength(artifact.max_samples)
  const scores: number[] = []
  const flags: Array<0 | 1> = []

  for (const row of rows) {
    let depth = 0
    for (const tree of artifact.trees) {
      depth += treeContribution(tree, row)
    }
    const scoreSamples = -(2 ** (-depth / normalizer))
    const decision = scoreSamples - artifact.offset
    scores.push(decision)
    flags.push(decision < 0 ? 1 : 0)
  }

  return { scores, flags }
}

export function predictAnomaliesLocally(values: number[]): {
  warmup_points_dropped: number
  anomaly: Array<number | null>
  anomaly_score: Array<number | null>
  message?: string
} {
  const warmup = Math.max(artifact.win_short, artifact.win_long) - 1
  if (values.length <= warmup) {
    return {
      warmup_points_dropped: warmup,
      anomaly: Array.from({ length: values.length }, () => null),
      anomaly_score: Array.from({ length: values.length }, () => null),
      message: `Need more than ${warmup} points to run anomaly detection`,
    }
  }

  const meanShort = rollingMean(values, artifact.win_short)
  const stdShort = rollingStd(values, artifact.win_short)
  const meanLong = rollingMean(values, artifact.win_long)
  const stdLong = rollingStd(values, artifact.win_long)
  const featureValues: Record<string, Array<number | null>> = {
    value: values,
    rolling_mean_5: meanShort,
    rolling_std_5: stdShort,
    rolling_mean_20: meanLong,
    rolling_std_20: stdLong,
  }

  const rows: number[][] = []
  for (let index = warmup; index < values.length; index += 1) {
    rows.push(artifact.features.map((name) => featureValues[name][index] as number))
  }

  const { scores, flags } = scoreRows(rows)
  const pad = Array.from({ length: warmup }, () => null)

  return {
    warmup_points_dropped: warmup,
    anomaly: [...pad, ...flags],
    anomaly_score: [...pad, ...scores],
  }
}
