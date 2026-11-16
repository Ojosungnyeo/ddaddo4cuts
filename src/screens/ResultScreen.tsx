import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Mascot } from '../components/Mascot'
import { usePhotoTransfer } from '../features/photoTransfer/usePhotoTransfer'
import { getTransferTimings } from '../features/photoTransfer/timings'
import type { PhotoSession } from '../types'
import { composePhotoOnce } from '../utils/composePhotoOnce'

interface ResultScreenProps {
  session: PhotoSession
  uploadConsent: boolean
  resultStartedAt: number
  onRestart: () => void
}

export function ResultScreen({ session, uploadConsent, resultStartedAt, onRestart }: ResultScreenProps) {
  const [attempt, setAttempt] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const compositionMs = useRef<number | null>(null)
  const qrStartedAt = useRef<number | null>(null)
  const reported = useRef(false)
  const transfer = usePhotoTransfer(blob, uploadConsent)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setBlob(null)
    setImageUrl(null)
    setError(null)

    const compositionStartedAt = performance.now()
    void composePhotoOnce(session)
      .then((composedBlob) => {
        compositionMs.current = performance.now() - compositionStartedAt
        objectUrl = URL.createObjectURL(composedBlob)
        if (cancelled) URL.revokeObjectURL(objectUrl)
        else {
          setBlob(composedBlob)
          setImageUrl(objectUrl)
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : '사진을 합성하지 못했어요.')
        }
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [session, attempt])

  useEffect(() => {
    let current = true
    setQrUrl(null)
    if (transfer.status !== 'ready' || !transfer.result) return () => { current = false }
    const shareUrl = `${window.location.origin}/photo/${transfer.result.shareToken}`
    qrStartedAt.current = performance.now()
    void QRCode.toDataURL(shareUrl, {
      width: 400,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then((url) => {
      if (current) setQrUrl(url)
    })
    return () => { current = false }
  }, [transfer.status, transfer.result])

  return (
    <main className="screen result-screen">
      <div className="result-screen__content">
        <Mascot size="result" />
        <h1>따또네컷 완성!</h1>
        <div className="result-screen__delivery">
          <div className="result-screen__photo-column">
            <div className="result-screen__preview" aria-live="polite">
              {imageUrl ? (
                <img className="result-screen__image" src={imageUrl} alt="선택한 프레임에 합성된 네컷 사진" />
              ) : error ? (
                <div className="result-screen__message" role="alert">
                  <p>{error}</p>
                  <button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>
                    다시 시도하기
                  </button>
                </div>
              ) : (
                <p className="result-screen__message" role="status">네컷 사진을 만드는 중...</p>
              )}
            </div>
          </div>
          <div className="result-screen__transfer" aria-live="polite">
            {transfer.status === 'idle' && <p>사진을 준비하고 있어요...</p>}
            {transfer.status === 'uploading' && <p role="status">QR 사진을 업로드하는 중...</p>}
            {transfer.status === 'delayed' && (
              <div className="result-screen__transfer-error" role="status">
                <p>사진 전송이 평소보다 오래 걸리고 있어요. 연결이 회복되면 QR이 자동으로 표시됩니다.</p>
                {imageUrl && <a className="primary-button" href={imageUrl} download="ddaddo4cuts.png">PNG 사진 저장하기</a>}
              </div>
            )}
            {transfer.status === 'error' && (
              <div className="result-screen__transfer-error" role="alert">
                <p>{transfer.error}</p>
                <button className="primary-button" onClick={transfer.retry}>업로드 다시 시도하기</button>
                {imageUrl && <a className="primary-button" href={imageUrl} download="ddaddo4cuts.png">PNG 사진 저장하기</a>}
              </div>
            )}
            {transfer.status === 'ready' && qrUrl && (
              <>
                <img className="result-screen__qr" src={qrUrl} alt="사진 다운로드용 QR코드" onLoad={() => {
                  if (import.meta.env.VITE_ENABLE_QR_TIMINGS !== 'true' || reported.current || !blob) return
                  reported.current = true
                  requestAnimationFrame(() => {
                    const transferTimings = getTransferTimings(blob)
                    console.table({
                      'PNG 합성·인코딩 (ms)': Math.round(compositionMs.current ?? 0),
                      '/api/photos/create (ms)': Math.round(transferTimings?.createMs ?? 0),
                      'Storage 업로드 (ms)': Math.round(transferTimings?.uploadMs ?? 0),
                      '/api/photos/complete (ms)': Math.round(transferTimings?.completeMs ?? 0),
                      'QR 생성·표시 (ms)': Math.round(performance.now() - (qrStartedAt.current ?? performance.now())),
                      '전체 촬영 완료→QR (ms)': Math.round(performance.now() - resultStartedAt),
                      '합성 PNG (MiB)': Number((blob.size / 1024 / 1024).toFixed(2)),
                    })
                  })
                }} />
                <p className="result-screen__qr-guide">QR코드를 스캔하여 사진을 다운로드하세요!</p>
              </>
            )}
          </div>
        </div>
      </div>
      <button className="result-screen__home" onClick={onRestart} aria-label="처음으로 돌아가기">
        <img src="/assets/figma-home-icon.svg" alt="" />
      </button>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
