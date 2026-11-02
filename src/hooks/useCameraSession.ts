import { useEffect, useRef, useState } from 'react'
import { captureFrame } from '../utils/captureFrame'

type CameraStatus = 'preparing' | 'ready' | 'error'

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return '카메라 권한이 거부되었어요. 브라우저 설정에서 카메라를 허용한 뒤 다시 시도해 주세요.'
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return '연결된 카메라를 찾을 수 없어요. 카메라 연결 상태를 확인해 주세요.'
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return '카메라를 사용할 수 없어요. 다른 앱에서 카메라를 사용 중인지 확인해 주세요.'
    }
  }
  return error instanceof Error ? error.message : '카메라를 시작하지 못했어요. 다시 시도해 주세요.'
}

export function useCameraSession(
  isShooting: boolean,
  onReady: () => void,
  onComplete: (photos: string[]) => void,
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const photosRef = useRef<string[]>([])
  const capturedShotRef = useRef(0)
  const callbacksRef = useRef({ onReady, onComplete })
  callbacksRef.current = { onReady, onComplete }

  const [status, setStatus] = useState<CameraStatus>('preparing')
  const [error, setError] = useState<string | null>(null)
  const [shotNumber, setShotNumber] = useState(1)
  const [countdown, setCountdown] = useState(5)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    let acquiredStream: MediaStream | null = null

    async function openCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('이 브라우저에서 카메라를 사용할 수 없어요. localhost 또는 HTTPS에서 열어 주세요.')
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        })
        acquiredStream = stream
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) throw new Error('카메라 화면을 준비하지 못했어요.')
        video.srcObject = stream
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.onended = () => {
            if (!cancelled) {
              setError('카메라 연결이 끊어졌어요. 다시 시도해 주세요.')
              setStatus('error')
            }
          }
        }
        await video.play()
        if (!cancelled) {
          setStatus('ready')
          callbacksRef.current.onReady()
        }
      } catch (caught) {
        acquiredStream?.getTracks().forEach((track) => track.stop())
        if (!cancelled) {
          setError(cameraErrorMessage(caught))
          setStatus('error')
        }
      }
    }

    void openCamera()
    return () => {
      cancelled = true
      acquiredStream?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    if (!isShooting || status !== 'ready') return

    const timer = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1)
        return
      }
      if (capturedShotRef.current >= shotNumber) return
      capturedShotRef.current = shotNumber

      try {
        const video = videoRef.current
        if (!video || !streamRef.current?.active) throw new Error('카메라 연결이 끊어졌어요.')
        photosRef.current = [...photosRef.current, captureFrame(video)]
        setFlash(true)

        if (shotNumber === 4) {
          callbacksRef.current.onComplete(photosRef.current)
        } else {
          setShotNumber(shotNumber + 1)
          setCountdown(5)
        }
      } catch (caught) {
        streamRef.current?.getTracks().forEach((track) => {
          track.onended = null
          track.stop()
        })
        streamRef.current = null
        setError(cameraErrorMessage(caught))
        setStatus('error')
      }
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [isShooting, status, shotNumber, countdown])

  useEffect(() => {
    if (!flash) return
    const timer = window.setTimeout(() => setFlash(false), 180)
    return () => window.clearTimeout(timer)
  }, [flash])

  return { videoRef, status, error, shotNumber, countdown, flash }
}
