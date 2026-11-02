import { useEffect, useState } from 'react'
import { Mascot } from '../components/Mascot'
import type { PhotoSession } from '../types'
import { composeFourCut } from '../utils/composeFourCut'

interface ResultScreenProps {
  session: PhotoSession
  onRestart: () => void
}

function downloadFileName(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `ddaddo4cuts_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.png`
}

export function ResultScreen({ session, onRestart }: ResultScreenProps) {
  const [attempt, setAttempt] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setImageUrl(null)
    setError(null)

    void composeFourCut(session)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        if (cancelled) URL.revokeObjectURL(objectUrl)
        else setImageUrl(objectUrl)
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
      <button className="result-screen__home" onClick={onRestart} aria-label="처음으로 돌아가기">
        <img src="/assets/figma-home-icon.svg" alt="" />
      </button>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
