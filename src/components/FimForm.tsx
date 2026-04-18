'use client'

import { useState, useEffect } from 'react'
import { FIM_CATEGORIES, FIM_SCORE_OPTIONS, calcTotals, defaultFimValues, ALL_FIM_KEYS } from '@/lib/fim'

type Props = {
  onSubmit: (values: Record<string, number | string>) => Promise<void>
  submitLabel?: string
  evaluationDate?: string
  evaluationType?: 'baseline' | 'quarterly'
  initialNotes?: string
  disabled?: boolean
}

export default function FimForm({
  onSubmit,
  submitLabel = '保存',
  evaluationDate: defaultDate = '',
  evaluationType = 'quarterly',
  initialNotes = '',
  disabled = false,
}: Props) {
  const [scores, setScores] = useState<Record<string, number>>(defaultFimValues())
  const [evalDate, setEvalDate]   = useState(defaultDate)
  const [notes, setNotes]         = useState(initialNotes)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const totals = calcTotals(scores)

  function setScore(key: string, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!evalDate) { setError('評価日を入力してください'); return }

    const missing = ALL_FIM_KEYS.find((k) => !scores[k])
    if (missing) { setError('全18項目を入力してください'); return }

    setSaving(true)
    try {
      await onSubmit({ ...scores, evaluationDate: evalDate, notes, evaluationType })
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 評価日 */}
      <div className="bg-white rounded-lg border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          評価日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={evalDate}
          onChange={(e) => setEvalDate(e.target.value)}
          required
          disabled={disabled}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* FIM 18項目 */}
      {FIM_CATEGORIES.map((category) => (
        <div key={category.label} className="bg-white rounded-lg border overflow-hidden">
          <div className="bg-blue-700 text-white px-4 py-2 font-semibold text-sm">
            {category.label}
          </div>
          {category.groups.map((group) => (
            <div key={group.label}>
              <div className="bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wide border-b">
                {group.label}
              </div>
              <div className="divide-y">
                {group.items.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-44 text-sm font-medium text-gray-800 shrink-0">{label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {FIM_SCORE_OPTIONS.map(({ value, label: optLabel }) => (
                        <button
                          key={value}
                          type="button"
                          disabled={disabled}
                          onClick={() => setScore(key, value)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                            scores[key] === value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                          } disabled:opacity-50`}
                          title={optLabel}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="ml-auto text-xs text-gray-500 hidden sm:block">
                      {FIM_SCORE_OPTIONS.find((o) => o.value === scores[key])?.label ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* 合計スコア */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">合計スコア（自動計算）</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: '運動合計',  value: totals.motorTotal,    max: 91 },
            { label: '認知合計',  value: totals.cognitiveTotal, max: 35 },
            { label: 'FIM合計',   value: totals.totalFim,      max: 126 },
          ].map(({ label, value, max }) => (
            <div key={label} className="bg-white rounded-lg border p-3">
              <div className="text-2xl font-bold text-blue-700">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}（最大{max}）</div>
            </div>
          ))}
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-lg border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="特記事項があれば入力してください"
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-4 py-2">
          {error}
        </div>
      )}

      {!disabled && (
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? '保存中...' : submitLabel}
        </button>
      )}
    </form>
  )
}
