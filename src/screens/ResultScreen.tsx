import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Mascot } from '../components/Mascot'
import { usePhotoTransfer } from '../features/photoTransfer/usePhotoTransfer'
import type { PhotoSession } from '../types'
import { composePhotoOnce } from '../utils/composePhotoOnce'

interface ResultScreenProps {
  session: PhotoSession
  uploadConsent: boolean
  onRestart: () => void
}

function downloadFileName(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `ddaddo4cuts_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.png`
}

export function ResultScreen({ session, uploadConsent, onRestart }: ResultScreenProps) {
  const [attempt, setAttempt] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const transfer = usePhotoTransfer(blob, uploadConsent)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setBlob(null)
    setImageUrl(null)
    setError(null)

    void composePhotoOnce(session)
      .then((composedBlob) => {
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

  function download() {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = downloadFileName(new Date())
    document.body.append(link)
    link.click()
    link.remove()
  }

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
            <button className="primary-button result-screen__button" onClick={download} disabled={!imageUrl}>사진 저장하기</button>
          </div>
          <div className="result-screen__transfer" aria-live="polite">
            {!uploadConsent && (
              <p>임시 저장에 동의하지 않아 QR 업로드를 진행하지 않았어요.<br />사진 저장하기는 그대로 사용할 수 있습니다.</p>
            )}
            {uploadConsent && transfer.status === 'idle' && <p>사진을 준비하고 있어요...</p>}
            {uploadConsent && transfer.status === 'uploading' && <p role="status">QR 사진을 업로드하는 중...</p>}
            {uploadConsent && transfer.status === 'error' && (
              <div className="result-screen__transfer-error" role="alert">
                <p>{transfer.error}</p>
                <button className="primary-button" onClick={transfer.retry}>업로드 다시 시도하기</button>
              </div>
            )}
            {uploadConsent && transfer.status === 'ready' && qrUrl && (
              <>
                <img className="result-screen__qr" src={qrUrl} alt="사진 다운로드용 QR코드" />
                <p className="result-screen__qr-guide">QR코드를 스캔하여 사진을 다운로드하세요!</p>
                <p className="result-screen__expiry">사진은 촬영 후 24시간이 지나면 자동으로 삭제됩니다.</p>
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
