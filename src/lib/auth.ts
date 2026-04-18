import { NextRequest } from 'next/server'
import { getDb } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

export function getUserEmailFromRequest(request: NextRequest): string | null {
  // 本番: Cloudflare Access がこのヘッダーをセット
  const email = request.headers.get('CF-Access-Authenticated-User-Email')
  if (email) return email

  // 開発環境のみ: .dev.vars の DEV_USER_EMAIL を使用
  if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_USER_EMAIL ?? 'dev@example.com'
  }

  return null
}

export async function getCurrentUser(request: NextRequest, db: D1Database) {
  const email = getUserEmailFromRequest(request)
  if (!email) return null

  const drizzle = getDb(db)
  return drizzle.select().from(users).where(eq(users.email, email)).get()
}
