import { useCallback, useEffect, useState } from 'react'
import { transferPhoto, type PhotoTransferResult } from './api'

type TransferStatus = 'idle' | 'uploading' | 'ready' | 'error'

export function usePhotoTransfer(blob: Blob | null, enabled: boolean) {
  const [status, setStatus] = useState<TransferStatus>('idle')
  const [result, setResult] = useState<PhotoTransferResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    setResult(null)
    setError(null)
    if (!blob || !enabled) {
      setStatus('idle')
      return () => { current = false }
    }

    setStatus('uploading')
    void transferPhoto(blob)
      .then((nextResult) => {
        if (!current) return
        setResult(nextResult)
        setStatus('ready')
      })
      .catch((caught: unknown) => {
        if (!current) return
        setError(caught instanceof Error ? caught.message : '사진 업로드에 실패했어요.')
        setStatus('error')
      })
    return () => { current = false }
  }, [blob, enabled, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  return { status, result, error, retry }
}
