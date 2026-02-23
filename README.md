# MEO Consul Tool - MEOコンサル支援ツール

MEO運用における **計測 → 要因分析 → 施策立案 → 実行 → レポート → 改善** を一気通貫で支援するWebアプリケーションです。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) / TypeScript
- **ホスティング**: Vercel
- **BaaS**: Supabase (PostgreSQL / Auth / Storage / RLS)
- **UI**: shadcn/ui + Tailwind CSS v4
- **チャート**: Recharts
- **フォーム**: React Hook Form + Zod

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabaseの接続情報を設定してください。

```bash
cp .env.local.example .env.local
```

Supabaseダッシュボードから以下の値を取得して設定:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. データベースのセットアップ

Supabaseダッシュボードの SQL Editor で以下を順に実行:

1. `supabase/migrations/00001_initial_schema.sql` - テーブル・RLS・トリガー作成
2. `supabase/seed.sql` - デモデータ投入（オプション）

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/          # ログイン・サインアップ
│   ├── (admin)/admin/   # 管理側コンソール
│   ├── (client)/client/ # クライアントポータル
│   └── auth/callback/   # OAuth コールバック
├── components/
│   ├── ui/              # shadcn/ui コンポーネント
│   ├── layouts/         # サイドバー・ヘッダー
│   ├── dashboard/       # ダッシュボード用ウィジェット
│   └── shared/          # 共通コンポーネント
├── lib/
│   ├── supabase/        # Supabase クライアント設定
│   ├── auth/            # 認証ヘルパー
│   ├── constants.ts     # 定数・ナビゲーション
│   └── mock-data.ts     # デモ用モックデータ
└── types/               # TypeScript 型定義
```

## ロール

| ロール | 画面 | 説明 |
|--------|------|------|
| Agency Admin | 管理側 | 全機能利用可能、権限管理 |
| Operator | 管理側 | 分析・施策作成（権限管理不可） |
| Client Viewer | クライアント | 成果閲覧・レポートDL・承認 |
| Client Operator | クライアント | 素材アップロード・口コミ返信 |

## 管理側画面

- ダッシュボード（担当案件一覧・異常検知・本日のタスク）
- 順位計測（グリッド順位・KWセット管理）
- 要因分解（原因候補ランキング・推奨アクション）
- 競合監視（変更検知・通知）
- 施策ボード（タスク管理・承認フロー）
- 口コミ運用（テーマ分類・返信テンプレート）
- GBP更新管理（安全/危険項目・監査ログ）
- レポート生成（1クリック月次レポート）

## クライアント画面

- ダッシュボード（KPI・順位推移・施策状況・アラート）
- 月次レポート（PDFダウンロード・共有URL）
- 承認センター（施策の承認・差戻し）
- 素材提出（依頼ボックス・アップロード）
- 口コミ（一覧・返信承認）
