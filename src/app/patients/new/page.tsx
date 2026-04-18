'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FimForm from '@/components/FimForm'

type Step = 'basic' | 'fim'

export default function NewPatientPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basic')
  const [basicData, setBasicData] = useState({
    patientCode:   '',
    gender:        'male',
    birthDate:     '',
    diagnosis:     '',
    onsetDate:     '',
    dischargeDate: '',
    notes:         '',
  })
  const [error, setError] = useState('')

  function handleBasicSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { patientCode, birthDate, diagnosis, dischargeDate } = basicData
    if (!patientCode || !birthDate || !diagnosis || !dischargeDate) {
      setError('必須項目（*）をすべて入力してください')
      return
    }
    setStep('fim')
  }

  async function handleFimSubmit(fimValues: Record<string, number | string>) {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...basicData,
        evaluation: {
          ...fimValues,
          evaluationDate: basicData.dischargeDate,
        },
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? '登録に失敗しました')
    }

    const patient = await res.json()
    router.push(`/patients/${patient.id}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ステップ表示 */}
      <div className="flex items-center gap-3">
        {(['basic', 'fim'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-gray-300" />}
            <div className={`flex items-center gap-2 ${step === s ? 'text-blue-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step === s ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                {i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {s === 'basic' ? '基本情報' : 'ベースラインFIM'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {step === 'basic' && (
        <form onSubmit={handleBasicSubmit} className="space-y-4">
          <h1 className="text-xl font-bold text-gray-800">新規患者登録 — 基本情報</h1>

          <div className="bg-white rounded-xl border p-5 space-y-4">
            <Field label="患者コード" required>
              <input
                type="text"
                value={basicData.patientCode}
                onChange={(e) => setBasicData({ ...basicData, patientCode: e.target.value })}
                placeholder="例: PT-2024-001"
                className={inputCls}
              />
            </Field>

            <Field label="性別" required>
              <select
                value={basicData.gender}
                onChange={(e) => setBasicData({ ...basicData, gender: e.target.value })}
                className={inputCls}
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </Field>

            <Field label="生年月日" required>
              <input
                type="date"
                value={basicData.birthDate}
                onChange={(e) => setBasicData({ ...basicData, birthDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="診断名" required>
              <input
                type="text"
                value={basicData.diagnosis}
                onChange={(e) => setBasicData({ ...basicData, diagnosis: e.target.value })}
                placeholder="例: 脳梗塞（左片麻痺）"
                className={inputCls}
              />
            </Field>

            <Field label="発症日">
              <input
                type="date"
                value={basicData.onsetDate}
                onChange={(e) => setBasicData({ ...basicData, onsetDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="退院日" required>
              <input
                type="date"
                value={basicData.dischargeDate}
                onChange={(e) => setBasicData({ ...basicData, dischargeDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="備考">
              <textarea
                value={basicData.notes}
                onChange={(e) => setBasicData({ ...basicData, notes: e.target.value })}
                rows={3}
                placeholder="特記事項など"
                className={inputCls}
              />
            </Field>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            次へ：ベースラインFIM入力 →
          </button>
        </form>
      )}

      {step === 'fim' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('basic')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← 基本情報に戻る
            </button>
            <h1 className="text-xl font-bold text-gray-800">ベースラインFIM入力</h1>
          </div>
          <p className="text-sm text-gray-500">
            退院日（{basicData.dischargeDate}）時点のFIM評価を入力してください。
          </p>
          <FimForm
            onSubmit={handleFimSubmit}
            submitLabel="患者登録 ＆ FIM保存"
            evaluationDate={basicData.dischargeDate}
            evaluationType="baseline"
          />
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Field({ label, required, children }: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
