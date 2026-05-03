# AI野郎 Website

AI野郎メンバーによる、AI野郎メンバーのためのオープンソース Web サイトです。メンバー各自のプロジェクトや活動を一覧できる場所として運用します。

## 技術スタック

- Vite 8
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## 必要環境

- Node.js `^20.19.0 || >=22.12.0`
- npm

## セットアップ

```bash
node -v
npm install
npm run dev
```

開発サーバー起動後、ターミナルに表示されるローカル URL をブラウザで開いてください。

## よく使うコマンド

```bash
npm run dev      # 開発サーバーを起動
npm run build    # TypeScript チェックと本番ビルド
npm run preview  # 本番ビルドをローカルで確認
```

## ディレクトリ構成

- `src/App.tsx`: アプリ全体の表示制御とセクション構成
- `src/components/`: ヘッダー、ローダー、背景 Canvas、共通 UI
- `src/sections/`: トップページの各セクション
- `src/config/site.ts`: サイト名、外部リンク、ナビゲーションなどの共通設定
- `src/data/memberProjects.ts`: メンバーのプロジェクト情報
- `src/index.css`: Tailwind とグローバルスタイル

## プロジェクト情報の追加

メンバーのプロジェクト一覧は [`src/data/memberProjects.ts`](src/data/memberProjects.ts) で管理しています。

1. `memberProjects` 配列に自分のプロジェクトを追加します。
2. `id` は重複しない短い文字列にします。
3. `url` には公開して問題ない GitHub、デモ、ドキュメントなどの URL を入れます。
4. `updatedAt` は `YYYY-MM-DD` 形式で入力します。
5. `npm run build` で壊れていないことを確認してから Pull Request を作成します。

サイト名、GitHub リポジトリ URL、トークン URL、ナビゲーション項目などの共通設定は [`src/config/site.ts`](src/config/site.ts) で管理しています。

## セキュリティ方針

このリポジトリは公開前提です。以下は必ず守ってください。

- API キー、トークン、パスワード、秘密鍵、証明書、Cookie、個人の `.env` はコミットしないでください。
- Vite の `VITE_` で始まる環境変数はブラウザに公開されます。秘密情報を入れないでください。
- `.env.example` には値を入れず、必要な変数名と説明だけを書いてください。
- `.npmrc` などの package manager 設定には認証トークンが入ることがあるため、実ファイルはコミット対象外です。
- メンバーの個人情報、非公開 URL、内部向け資料へのリンクは、本人と運用メンバーの許可を得てから掲載してください。
- 依存関係を追加・更新した場合は、`npm run build` と `npm audit --audit-level=moderate` を通してください。

もし秘密情報を誤ってコミットした場合は、すぐに該当キーを失効・再発行し、履歴からの削除を運用メンバーに相談してください。履歴から消すだけでは漏えい対策として不十分です。

## コントリビューション

1. Issue または Pull Request で変更内容を説明してください。
2. UI 変更はスクリーンショットや確認観点を添えてください。
3. Pull Request を作成する前に `npm run build` を実行してください。
4. 依存関係を変更した場合は `npm audit --audit-level=moderate` も実行してください。
5. データ追加だけの場合も、公開して問題ない情報だけを含めてください。
6. レビューで指摘されたセキュリティ・プライバシー項目は優先して対応してください。

## ライセンス

ライセンスは未設定です。正式公開前に、AI野郎メンバー間で採用するオープンソースライセンスを決定してください。
