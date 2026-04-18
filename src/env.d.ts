interface CloudflareEnv {
  DB: D1Database
}

declare module '@cloudflare/next-on-pages' {
  interface CloudflareEnv {
    DB: D1Database
  }
}
