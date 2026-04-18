# セットアップ手順（エンジニア向け）

## 1. パッケージインストール
```bash
npm install
```

## 2. Cloudflare D1 データベース作成
```bash
# D1 データベースを作成（database_id が発行される）
npx wrangler d1 create rehab-fim-db
```
発行された `database_id` を `wrangler.toml` の `YOUR_DATABASE_ID_HERE` に貼り付ける。

## 3. マイグレーション実行
```bash
# ローカル（開発用）
npm run db:migrate:local

# 本番
npm run db:migrate:prod
```

## 4. ローカル開発
```bash
# .dev.vars ファイルを作成（gitignore 済み）
echo 'DEV_USER_EMAIL="あなたのメールアドレス"' > .dev.vars

npm run dev
```

## 5. 本番デプロイ
```bash
npm run deploy
```

## 6. Cloudflare Access 設定（セキュリティ必須）
Cloudflare Zero Trust ダッシュボード で以下を設定：
- Application 作成 → デプロイした Workers URL を指定
- Policy に「許可するメールアドレス一覧」を追加

## 7. スタッフ登録
初回のみ D1 コンソールで直接 INSERT：
```sql
INSERT INTO users (email, name, facility_id, role)
VALUES ('staff@yourcompany.com', '担当者名', 2, 'staff');
```

## セキュリティチェックリスト
- [ ] GitHub リポジトリを Private に設定
- [ ] .dev.vars がコミットされていないことを確認
- [ ] Cloudflare Access の設定完了
- [ ] 施設名を初期データに反映（migrations/0001_initial.sql）
- [ ] wrangler.toml の database_id が設定済み
