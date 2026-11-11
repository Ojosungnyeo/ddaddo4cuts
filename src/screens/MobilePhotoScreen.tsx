import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getPhotoAccess, PhotoAccessError } from '../features/photoTransfer/api'

type MobileState = 'loading' | 'ready' | 'expired' | 'not-found' | 'error'

export function MobilePhotoScreen({ token }: { token: string }) {
  const [state, setState] = useState<MobileState>('loading')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let current = true
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      setState('not-found')
      setImageUrl(null)
      return () => { current = false }
    }
    setState('loading')
    setImageUrl(null)
    void getPhotoAccess(token)
      .then((access) => {
        if (!current) return
        setImageUrl(access.signedUrl)
        setState('ready')
      })
      .catch((error: unknown) => {
        if (!current) return
        if (error instanceof PhotoAccessError) setState(error.kind === 'network' ? 'error' : error.kind)
        else setState('error')
      })
    return () => { current = false }
  }, [token, attempt])

  async function download() {
    setDownloading(true)
    try {
      const access = await getPhotoAccess(token, true)
      const link = document.createElement('a')
      link.href = access.signedUrl
      link.download = 'ddaddo4cuts.png'
      document.body.append(link)
      link.click()
      link.remove()
    } catch (error) {
      if (error instanceof PhotoAccessError && error.kind !== 'network') setState(error.kind)
      else setState('error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main className="screen mobile-photo-screen">
      <div className="mobile-photo-screen__content">
        <h1>따또네컷</h1>
        {state === 'loading' && <p role="status">사진을 불러오는 중...</p>}
        {state === 'ready' && imageUrl && (
          <>
            <img className="mobile-photo-screen__image" src={imageUrl} alt="따또네컷 사진" />
            <button className="primary-button" onClick={download} disabled={downloading}>
              {downloading ? '다운로드 준비 중...' : '사진 저장하기'}
            </button>
            <p className="mobile-photo-screen__notice">사진은 촬영 후 24시간 동안만 다운로드할 수 있어요.</p>
          </>
        )}
        {state === 'expired' && <PhotoMessage title="사진 보관 기간이 끝났어요" detail="촬영 후 24시간이 지나 사진이 삭제되었습니다." />}
        {state === 'not-found' && <PhotoMessage title="사진을 찾을 수 없어요" detail="QR코드나 주소가 올바른지 확인해 주세요." />}
        {state === 'error' && (
          <PhotoMessage title="사진을 불러오지 못했어요" detail="네트워크 연결을 확인한 뒤 다시 시도해 주세요.">
            <button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>다시 시도하기</button>
          </PhotoMessage>
        )}
      </div>
    </main>
  )
}

function PhotoMessage({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return (
    <div className="mobile-photo-screen__message" role="status">
      <h2>{title}</h2>
      <p>{detail}</p>
      {children}
    </div>
  )
}
