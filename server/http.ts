const JSON_LIMIT_BYTES = 4096

export function json(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  })
}

export function methodNotAllowed(allowed: string): Response {
  return json({ error: 'method_not_allowed' }, 405, { Allow: allowed })
}

export async function readSmallJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim()
  if (contentType !== 'application/json') throw new ApiError(415, 'unsupported_media_type')

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > JSON_LIMIT_BYTES) throw new ApiError(413, 'request_too_large')

  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > JSON_LIMIT_BYTES) {
    throw new ApiError(413, 'request_too_large')
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError(400, 'invalid_json')
  }
}

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-forwarded-for')
  return forwarded?.split(',', 1)[0].trim() || 'unknown'
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code)
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) return json({ error: error.code }, error.status)
  return json({ error: 'internal_error' }, 500)
}
