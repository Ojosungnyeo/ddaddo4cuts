export interface TransferTimings {
  createMs: number
  uploadMs: number
  completeMs: number
}

const timings = new WeakMap<Blob, TransferTimings>()

export function recordTransferTiming(blob: Blob, stage: keyof TransferTimings, elapsedMs: number) {
  const current = timings.get(blob) ?? { createMs: 0, uploadMs: 0, completeMs: 0 }
  current[stage] += elapsedMs
  timings.set(blob, current)
}

export function getTransferTimings(blob: Blob): TransferTimings | undefined {
  return timings.get(blob)
}
