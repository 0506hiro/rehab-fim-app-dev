import { NextRequest, NextResponse } from 'next/server'

export const config = { matcher: ['/api/:path*'] }

export function middleware(request: NextRequest) {
  const email = request.headers.get('CF-Access-Authenticated-User-Email')

  // 本番環境では Cloudflare Access が通していないリクエストを拒否
  if (process.env.NODE_ENV !== 'development' && !email) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  return NextResponse.next()
}
