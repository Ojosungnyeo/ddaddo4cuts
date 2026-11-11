const DEFAULT_MAX_PHOTO_BYTES = 15 * 1024 * 1024
const DEFAULT_RATE_LIMIT_MAX = 10
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 10

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`)
  }
  return value
}

export function serverConfig() {
  return {
    supabaseUrl: required('SUPABASE_URL'),
    supabaseSecretKey: required('SUPABASE_SECRET_KEY'),
    storageBucket: required('SUPABASE_STORAGE_BUCKET'),
    tokenPepper: required('PHOTO_TOKEN_PEPPER'),
    maxPhotoBytes: positiveInteger('PHOTO_MAX_BYTES', DEFAULT_MAX_PHOTO_BYTES),
    rateLimitMax: positiveInteger('PHOTO_RATE_LIMIT_MAX', DEFAULT_RATE_LIMIT_MAX),
    rateLimitWindowMinutes: positiveInteger(
      'PHOTO_RATE_LIMIT_WINDOW_MINUTES',
      DEFAULT_RATE_LIMIT_WINDOW_MINUTES,
    ),
  }
}
