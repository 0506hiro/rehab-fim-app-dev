import Link from 'next/link'

export const runtime = 'edge'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/patients"
          className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-4xl mb-3">👥</div>
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
            患者一覧
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            担当患者の一覧とFIM評価履歴を確認します
          </p>
        </Link>

        <Link
          href="/patients/new"
          className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
            新規患者登録
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            退院時の基本情報とベースラインFIMを登録します
          </p>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">FIMスコアの見方</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { label: '完全自立', score: '7', color: 'text-green-700' },
            { label: '修正自立', score: '6', color: 'text-green-600' },
            { label: '監視・準備', score: '5', color: 'text-yellow-600' },
            { label: '最小介助', score: '4', color: 'text-yellow-700' },
            { label: '中等度介助', score: '3', color: 'text-orange-600' },
            { label: '最大介助', score: '2', color: 'text-red-500' },
            { label: '全介助', score: '1', color: 'text-red-700' },
          ].map(({ label, score, color }) => (
            <div key={score} className="flex items-center gap-2">
              <span className={`font-bold text-base ${color}`}>{score}</span>
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          運動13項目（13〜91点）＋ 認知5項目（5〜35点）＝ FIM合計（18〜126点）
        </p>
      </div>
    </div>
  )
}
