# 菁々祭公式Webサイト

[![Code Quality Checks](https://github.com/2025seiseisai/seiseisai-admin/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/2025seiseisai/seiseisai-admin/actions/workflows/check.yml)

## Packages

TurborepoでMonorepo化しています。

- [/apps/admin](./apps/admin): 管理ページ。データベースを操作したりできます。
- [/apps/ticket-worker](./apps/ticket-worker): 定期的にデータベースのチェックを行い、Web整理券の抽選などを行うコードが入っています。
- [/apps/tickets](./apps/tickets): Web整理券の応募ページ。
- [/packages/blog](./packages/blog): Blogのデータ。マークダウンファイルは実行時に自動的に一つのファイルにまとめられます。
- [/packages/news](./packages/news): Newsのマークダウンを表示するReactコンポーネント。
- [/packages/database](./packages/database): データベースを操作する関数や型など。/packages/database/prisma/schema.prismaにPrismaのスキーマが載っています。
- [/packages/date](./packages/date): dayjsのデフォルトを日本時間にしてエクスポートしています。このリポジトリ内では、Dateの代わりに全部このパッケージ内のdayjsを使用しています。
- [/packages/turnstile](./packages/turnstile): Cloudflare TurnstileのReact Componentと、サーバーでの検証をする関数が入っています。
- [/packages/ui](./packages/ui): shadcn/uiのコンポーネント。

## 動作環境

- OS: WindowsとUbuntuで動くのを確認しています
- VSCode: 編集に必要
- VSCode Extensions: [extensions.json](./.vscode/extensions.json)に書かれているVSCode拡張機能が必要です
- Bun: Javascriptランタイムとして[Bun](https://bun.com/)が必要です
- Node.js: Next.jsを動かすためのランタイムとして必要です

## 環境変数の設定方法

### /.env

```shell
DATABASE_URL="..." # prismaで使うデータベースへのURL
```

### /apps/admin/.env

```shell
AUTH_URL="https://admin.seiseisai.com" # Auth.jsが使用するURL (開発環境ならhttp://localhost:3001)
AUTH_SECRET_ADMIN="..." # Auth.jsが使用するランダムな文字列 (bunx auth secret --rawで生成可能)
HASH_SALT="..." # データベースにパスワードをハッシュ化して保存する際のソルト
SUPERADMIN_HASHED_PASSWORD="..." # superadminのパスワードをHASH_SALTと連結して、sha256でハッシュ化したもの
NEXT_PUBLIC_TURNSTILE_SITE_KEY_ADMIN="..." # Cloudflare Turnstileの公開鍵 (開発環境なら1x00000000000000000000AA)
TURNSTILE_SECRET_KEY_ADMIN="..." # Cloudflare Turnstileの秘密鍵 (開発環境なら1x0000000000000000000000000000000AA)
TICKET_HMAC_KEY_AUTH="..." # Web整理券の認証に使うランダムな文字列
```

### /apps/tickets/.env

```shell
AUTH_URL="https://tickets.seiseisai.com" # Auth.jsが使用するURL (開発環境ならhttp://localhost:3002)
AUTH_SECRET_TICKETS="..." # Auth.jsが使用するランダムな文字列 (bunx auth secret --rawで生成可能)
NEXT_PUBLIC_TURNSTILE_SITE_KEY_TICKETS="..." # Cloudflare Turnstileの公開鍵 (開発環境なら1x00000000000000000000AA)
TURNSTILE_SECRET_KEY_TICKETS="..." # Cloudflare Turnstileの秘密鍵 (開発環境なら1x0000000000000000000000000000000AA)
TICKET_HMAC_KEY_AUTH="..." # Web整理券の認証に使うランダムな文字列 (adminで使われている環境変数と同じ値)
TICKET_HMAC_KEY_LOGIN="..." # Web整理券の認証に使うランダムな文字列
```

## Development

ターミナルで`bun run dev:admin`で管理者ページ、`bun run dev:tickets`でWeb整理券のページを実行できます。

## Build & Start

同様に`.env`を保存して、

```shell
bun run build
bun run start
```

でビルドと実行ができます。

## Deploy

```shell
bun run deploy <gitのブランチ名>
```

でパッケージのインストールからビルド・実行などを自動で行います。
