import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq, isNull, and } from 'drizzle-orm'
import { getDb, patients, facilities, fimEvaluations } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ALL_FIM_KEYS, calcTotals } from '@/lib/fim'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { env } = getRequestContext<CloudflareEnv>()
  const user = await getCurrentUser(request, env.DB)
  if (!user) return NextResponse.json({ error: '認証エラー' }, { status: 401 })

  const db = getDb(env.DB)

  const condition = user.role === 'admin'
    ? isNull(patients.deletedAt)
    : and(isNull(patients.deletedAt), eq(patients.facilityId, user.facilityId!))

  const list = await db
    .select({
      id:            patients.id,
      patientCode:   patients.patientCode,
      gender:        patients.gender,
      birthDate:     patients.birthDate,
      diagnosis:     patients.diagnosis,
      dischargeDate: patients.dischargeDate,
      facilityId:    patients.facilityId,
      facilityName:  facilities.name,
      createdAt:     patients.createdAt,
    })
    .from(patients)
    .leftJoin(facilities, eq(patients.facilityId, facilities.id))
    .where(condition)
    .all()

  return NextResponse.json(list)
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext<CloudflareEnv>()
  const user = await getCurrentUser(request, env.DB)
  if (!user) return NextResponse.json({ error: '認証エラー' }, { status: 401 })

  const body = await request.json()
  const { patientCode, gender, birthDate, diagnosis, dischargeDate, onsetDate, notes, evaluation } = body

  if (!patientCode || !gender || !birthDate || !diagnosis || !dischargeDate) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  const facilityId = user.role === 'admin' && body.facilityId ? body.facilityId : user.facilityId
  if (!facilityId) return NextResponse.json({ error: '施設が未設定です' }, { status: 400 })

  const db = getDb(env.DB)

  const patient = await db.insert(patients).values({
    patientCode,
    facilityId,
    gender,
    birthDate,
    diagnosis,
    onsetDate: onsetDate || null,
    dischargeDate,
    notes: notes || null,
    createdBy: user.id,
  }).returning().get()

  // ベースライン評価を同時に登録
  if (evaluation) {
    const missing = ALL_FIM_KEYS.find((k) => evaluation[k] == null)
    if (missing) {
      return NextResponse.json({ error: `評価項目が不足しています: ${missing}` }, { status: 400 })
    }

    const totals = calcTotals(evaluation)
    await db.insert(fimEvaluations).values({
      patientId:      patient.id,
      facilityId,
      evaluatorId:    user.id,
      evaluationDate: evaluation.evaluationDate || dischargeDate,
      evaluationType: 'baseline',
      ...Object.fromEntries(ALL_FIM_KEYS.map((k) => [k, evaluation[k]])),
      ...totals,
      notes: evaluation.notes || null,
    })
  }

  return NextResponse.json(patient, { status: 201 })
}
