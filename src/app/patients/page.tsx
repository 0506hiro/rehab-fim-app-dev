'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Patient = {
  id: number
  patientCode: string
  gender: string
  birthDate: string
  diagnosis: string
  dischargeDate: string
  facilityName: string | null
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

const GENDER_LABEL: Record<string, string> = {
  male: '男性', female: '女性', other: 'その他',
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    fetch('/api/patients')
      .then((r) => r.json())
      .then((data) => { setPatients(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = patients.filter((p) =>
    p.patientCode.includes(search) || p.diagnosis.includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">患者一覧</h1>
        <Link
          href="/patients/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ＋ 新規登録
        </Link>
      </div>

      <input
        type="text"
        placeholder="患者コード・診断名で検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {search ? '該当する患者が見つかりません' : '患者が登録されていません'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['患者コード', '性別・年齢', '診断名', '退院日', '施設', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-700">{p.patientCode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {GENDER_LABEL[p.gender]}・{calcAge(p.birthDate)}歳
                  </td>
                  <td className="px-4 py-3 text-gray-800">{p.diagnosis}</td>
                  <td className="px-4 py-3 text-gray-600">{p.dischargeDate}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.facilityName ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/patients/${p.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
