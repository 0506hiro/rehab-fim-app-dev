import { NextRequest, NextResponse } from 'next/server'
import { getContext } from '@cloudflare/next-on-pages'
import { getCurrentUser } from '@/lib/auth'
import { getDb, facilities } from '@/lib/db'
import { eq } from 'drizzle-orm'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { env } = getContext<CloudflareEnv>()
  const user = await getCurrentUser(request, env.DB)

  if (!user) {
    return NextResponse.json({ error: 'ユーザーが見つかりません。管理者に登録を依頼してください。' }, { status: 404 })
  }

  const db = getDb(env.DB)
  const facility = user.facilityId
    ? await db.select().from(facilities).where(eq(facilities.id, user.facilityId)).get()
    : null

  return NextResponse.json({ ...user, facility })
}
