'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const FimChart = dynamic(() => import('@/components/FimChart'), { ssr: false })

type Evaluation = {
  id: number
  evaluationDate: string
  evaluationType: string
  motorTotal: number
  cognitiveTotal: number
  totalFim: number
  facilityName: string | null
  evaluatorName: string | null
  notes: string | null
}

type PatientDetail = {
  id: number
  patientCode: string
  gender: string
  birthDate: string
  diagnosis: string
  onsetDate: string | null
  dischargeDate: string
  notes: string | null
  facilityName: string | null
  evaluations: Evaluation[]
}

const GENDER_LABEL: Record<string, string> = {
  male: '男性', female: '女性', other: 'その他',
}
const TYPE_LABEL: Record<string, string> = {
  baseline: 'ベースライン', quarterly: '定期評価',
}

function calcAge(birthDate: string) {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  return age
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState('')

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => { setPatient(data); setLoading(false) })
      .catch((s) => {
        setError(s === 403 ? 'この患者へのアクセス権限がありません' : '患者情報の取得に失敗しました')
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>
  if (error || !patient) return (
    <div className="text-center py-20">
      <p className="text-red-600 mb-4">{error || '患者が見つかりません'}</p>
      <Link href="/patients" className="text-blue-600 hover:underline text-sm">← 患者一覧へ</Link>
    </div>
  )

  const sortedEvals = [...patient.evaluations].sort(
    (a, b) => b.evaluationDate.localeCompare(a.evaluationDate)
  )
  const latest = sortedEvals[0]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* パンくず */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/patients" className="hover:text-blue-600">患者一覧</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{patient.patientCode}</span>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{patient.patientCode}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {GENDER_LABEL[patient.gender]}・{calcAge(patient.birthDate)}歳（{patient.birthDate}生）
            </p>
          </div>
          <Link
            href={`/patients/${id}/evaluations/new`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            ＋ 定期評価を追加
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
          <Info label="診断名"   value={patient.diagnosis} />
          <Info label="発症日"   value={patient.onsetDate ?? '—'} />
          <Info label="退院日"   value={patient.dischargeDate} />
          <Info label="登録施設" value={patient.facilityName ?? '—'} />
          {latest && <Info label="最新FIM" value={`${latest.totalFim} 点（${latest.evaluationDate}）`} />}
        </div>

        {patient.notes && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-3">{patient.notes}</p>
        )}
      </div>

      {/* FIM経過グラフ */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">FIM経過グラフ</h2>
        <FimChart evaluations={patient.evaluations} />
      </div>

      {/* 評価履歴テーブル */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <h2 className="text-base font-semibold text-gray-800 px-5 py-4 border-b">評価履歴</h2>
        {sortedEvals.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">評価記録がありません</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['評価日', '種別', '運動', '認知', 'FIM合計', '施設', '評価者', '備考'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedEvals.map((e) => (
                <tr key={e.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{e.evaluationDate}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      e.evaluationType === 'baseline'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {TYPE_LABEL[e.evaluationType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{e.motorTotal}</td>
                  <td className="px-4 py-3 text-center">{e.cognitiveTotal}</td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-700">{e.totalFim}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.facilityName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.evaluatorName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-32 truncate">{e.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 font-medium">{label}</dt>
      <dd className="text-gray-800 mt-0.5">{value}</dd>
    </div>
  )
}
