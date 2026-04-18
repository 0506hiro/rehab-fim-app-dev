import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq, and, isNull } from 'drizzle-orm'
import { getDb, patients, facilities, fimEvaluations, users } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

export async function GET(request: NextRequest, { params }: Params) {
  const { env } = getRequestContext<CloudflareEnv>()
  const user = await getCurrentUser(request, env.DB)
  if (!user) return NextResponse.json({ error: '認証エラー' }, { status: 401 })

  const db = getDb(env.DB)
  const patientId = parseInt(params.id)

  const patient = await db
    .select({
      id:            patients.id,
      patientCode:   patients.patientCode,
      gender:        patients.gender,
      birthDate:     patients.birthDate,
      diagnosis:     patients.diagnosis,
      onsetDate:     patients.onsetDate,
      dischargeDate: patients.dischargeDate,
      notes:         patients.notes,
      facilityId:    patients.facilityId,
      facilityName:  facilities.name,
      createdAt:     patients.createdAt,
    })
    .from(patients)
    .leftJoin(facilities, eq(patients.facilityId, facilities.id))
    .where(and(eq(patients.id, patientId), isNull(patients.deletedAt)))
    .get()

  if (!patient) return NextResponse.json({ error: '患者が見つかりません' }, { status: 404 })

  // スタッフは自施設の患者のみ参照可
  if (user.role !== 'admin' && patient.facilityId !== user.facilityId) {
    return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })
  }

  const evaluations = await db
    .select({
      id:             fimEvaluations.id,
      evaluationDate: fimEvaluations.evaluationDate,
      evaluationType: fimEvaluations.evaluationType,
      motorTotal:     fimEvaluations.motorTotal,
      cognitiveTotal: fimEvaluations.cognitiveTotal,
      totalFim:       fimEvaluations.totalFim,
      facilityName:   facilities.name,
      evaluatorName:  users.name,
      notes:          fimEvaluations.notes,
    })
    .from(fimEvaluations)
    .leftJoin(facilities, eq(fimEvaluations.facilityId, facilities.id))
    .leftJoin(users, eq(fimEvaluations.evaluatorId, users.id))
    .where(and(
      eq(fimEvaluations.patientId, patientId),
      isNull(fimEvaluations.deletedAt),
    ))
    .all()

  return NextResponse.json({ ...patient, evaluations })
}
