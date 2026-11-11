import { createHmac, randomBytes } from 'node:crypto'
import { serverConfig } from './config.js'

const TOKEN_BYTES = 32
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function createToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && TOKEN_PATTERN.test(token)
}

export function hashSecret(value: string): string {
  return createHmac('sha256', serverConfig().tokenPepper).update(value).digest('hex')
}
