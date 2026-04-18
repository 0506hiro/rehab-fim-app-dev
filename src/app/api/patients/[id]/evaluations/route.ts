import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq, and, isNull } from 'drizzle-orm'
import { getDb, patients, fimEvaluations } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ALL_FIM_KEYS, calcTotals } from '@/lib/fim'

export const runtime = 'edge'

type Params = { params: { id: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const { env } = getRequestContext<CloudflareEnv>()
  const user = await getCurrentUser(request, env.DB)
  if (!user) return NextResponse.json({ error: '認証エラー' }, { status: 401 })

  const db = getDb(env.DB)
  const patientId = parseInt(params.id)

  const patient = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), isNull(patients.deletedAt)))
    .get()

  if (!patient) return NextResponse.json({ error: '患者が見つかりません' }, { status: 404 })

  if (user.role !== 'admin' && patient.facilityId !== user.facilityId) {
    return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })
  }

  const body = await request.json()
  const { evaluationDate, notes } = body

  if (!evaluationDate) {
    return NextResponse.json({ error: '評価日は必須です' }, { status: 400 })
  }

  const missing = ALL_FIM_KEYS.find((k) => body[k] == null)
  if (missing) {
    return NextResponse.json({ error: `評価項目が不足しています: ${missing}` }, { status: 400 })
  }

  const totals = calcTotals(body)
  const facilityId = user.facilityId ?? patient.facilityId

  const evaluation = await db.insert(fimEvaluations).values({
    patientId,
    facilityId,
    evaluatorId:    user.id,
    evaluationDate,
    evaluationType: 'quarterly',
    ...Object.fromEntries(ALL_FIM_KEYS.map((k) => [k, body[k]])),
    ...totals,
    notes: notes || null,
  }).returning().get()

  return NextResponse.json(evaluation, { status: 201 })
}
