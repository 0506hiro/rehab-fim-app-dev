'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

type Evaluation = {
  evaluationDate: string
  evaluationType: string
  motorTotal:     number
  cognitiveTotal: number
  totalFim:       number
}

type Props = { evaluations: Evaluation[] }

export default function FimChart({ evaluations }: Props) {
  if (evaluations.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        評価データがありません
      </div>
    )
  }

  const data = [...evaluations]
    .sort((a, b) => a.evaluationDate.localeCompare(b.evaluationDate))
    .map((e) => ({
      date:      e.evaluationDate.slice(0, 7), // YYYY-MM
      FIM合計:   e.totalFim,
      運動合計:  e.motorTotal,
      認知合計:  e.cognitiveTotal,
      type:      e.evaluationType,
    }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 130]} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ fontSize: 13, borderRadius: 8 }}
          formatter={(val: number, name: string) => [`${val} 点`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="FIM合計"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="運動合計"
          stroke="#059669"
          strokeWidth={1.5}
          dot={{ r: 4 }}
          strokeDasharray="4 2"
        />
        <Line
          type="monotone"
          dataKey="認知合計"
          stroke="#d97706"
          strokeWidth={1.5}
          dot={{ r: 4 }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
