'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',          label: 'ダッシュボード' },
  { href: '/patients',  label: '患者一覧' },
  { href: '/patients/new', label: '＋ 新規患者登録' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-6">
        <span className="font-bold text-lg tracking-tight whitespace-nowrap">
          リハビリ評価システム
        </span>
        <nav className="flex gap-1 flex-1 overflow-x-auto">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                pathname === href
                  ? 'bg-white text-blue-700 font-semibold'
                  : 'hover:bg-blue-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
