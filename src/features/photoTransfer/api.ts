import { createClient } from '@supabase/supabase-js'

export interface PhotoTransferResult {
  shareToken: string
  expiresAt: string
}

interface UploadAuthorization extends PhotoTransferResult {
  uploadId: string
  uploadBucket: string
  uploadPath: string
  uploadToken: string
  manageToken: string
}

interface TransferTask {
  authorization?: UploadAuthorization
  uploaded: boolean
  result?: PhotoTransferResult
  inFlight?: Promise<PhotoTransferResult>
}

const tasks = new WeakMap<Blob, TransferTask>()
let browserClient: ReturnType<typeof createClient> | undefined

function supabaseBrowser() {
  if (browserClient) return browserClient
  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) throw new Error('사진 전송 설정이 완료되지 않았어요.')
  browserClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return browserClient
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) throw new Error('사진 전송 서버에 연결하지 못했어요.')
  return response.json() as Promise<T>
}

async function runTransfer(blob: Blob, task: TransferTask): Promise<PhotoTransferResult> {
  if (!task.authorization) {
    task.authorization = await apiJson<UploadAuthorization>('/api/photos/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mimeType: 'image/png', sizeBytes: blob.size }),
    })
  }

  const authorization = task.authorization
  if (!task.uploaded) {
    const { error } = await supabaseBrowser().storage
      .from(authorization.uploadBucket)
      .uploadToSignedUrl(authorization.uploadPath, authorization.uploadToken, blob, {
        contentType: 'image/png',
      })
    if (error) throw new Error('사진 업로드에 실패했어요.')
    task.uploaded = true
  }

  await apiJson('/api/photos/complete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      uploadId: authorization.uploadId,
      manageToken: authorization.manageToken,
    }),
  })

  task.result = { shareToken: authorization.shareToken, expiresAt: authorization.expiresAt }
  return task.result
}

export function transferPhoto(blob: Blob): Promise<PhotoTransferResult> {
  let task = tasks.get(blob)
  if (!task) {
    task = { uploaded: false }
    tasks.set(blob, task)
  }
  if (task.result) return Promise.resolve(task.result)
  if (task.inFlight) return task.inFlight

  task.inFlight = runTransfer(blob, task).finally(() => {
    if (task) task.inFlight = undefined
  })
  return task.inFlight
}

export interface PhotoAccess {
  signedUrl: string
  photoExpiresAt: string
}

export class PhotoAccessError extends Error {
  constructor(readonly kind: 'expired' | 'not-found' | 'network') {
    super(kind)
  }
}

export async function getPhotoAccess(token: string, download = false): Promise<PhotoAccess> {
  let response: Response
  try {
    response = await fetch(`/api/photos/${encodeURIComponent(token)}${download ? '?download=1' : ''}`)
  } catch {
    throw new PhotoAccessError('network')
  }
  if (response.status === 410) throw new PhotoAccessError('expired')
  if (response.status === 404) throw new PhotoAccessError('not-found')
  if (!response.ok) throw new PhotoAccessError('network')
  return response.json() as Promise<PhotoAccess>
}
