'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FimForm from '@/components/FimForm'

export default function NewEvaluationPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  async function handleSubmit(values: Record<string, number | string>) {
    const res = await fetch(`/api/patients/${id}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? '保存に失敗しました')
    }

    router.push(`/patients/${id}`)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/patients" className="hover:text-blue-600">患者一覧</Link>
        <span>/</span>
        <Link href={`/patients/${id}`} className="hover:text-blue-600">患者詳細</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">定期評価入力</span>
      </div>

      <h1 className="text-xl font-bold text-gray-800">定期FIM評価入力（3か月ごと）</h1>
      <p className="text-sm text-gray-500">
        18項目すべてを入力してください。合計点は自動で計算されます。
      </p>

      <FimForm
        onSubmit={handleSubmit}
        submitLabel="評価を保存"
        evaluationType="quarterly"
      />
    </div>
  )
}
