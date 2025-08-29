# 菁々祭公式Webサイト

[![Code Quality Checks](https://github.com/2025seiseisai/seiseisai-admin/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/2025seiseisai/seiseisai-admin/actions/workflows/check.yml)

## Packages

TurborepoでMonorepo化しています。

- [/apps/admin](./apps/admin): 管理ページ。データベースを操作したりできます。
- [/apps/ticket-worker](./apps/ticket-worker): 定期的にデータベースのチェックを行い、Web整理券の抽選などを行うコードが入っています。
- [/apps/tickets](./apps/tickets): Web整理券の応募ページ。
- [/packages/database](./packages/database): データベースを操作する関数や型など。ここではPrismaを使っていますが、書き換えればCloudflare D1とかにも対応できるはず。
- [/packages/turnstile](./packages/turnstile): Cloudflare TurnstileのReact Componentと、サーバーでの検証をする関数が入っています。
- [/packages/ui](./packages/ui): shadcn/uiのコンポーネント。

## 動作環境

- OS: WindowsとUbuntuで動くのを確認しています
- RAM: 大量にメモリを食います
- VSCode: 編集に必要
- VSCode Extensions: [extensions.json](./.vscode/extensions.json)に書かれている拡張機能が必要です
- Bun: Javascriptランタイムとして[Bun](https://bun.com/)が必要です
- Node.js: Next.jsを動かすためのJavascriptランタイムとして[Node.js](https://nodejs.org/ja/)が必要です
    - `bun --bun run dev`みたいにすればBunだけでも動かせますが、一部の機能にNode.jsと互換性がなかったりメモリ消費量が激しかったりします

## Development

`.env`ファイルをルートディレクトリに置く必要があります。

```shell
DATABASE_URL=PostgreSQLのURL
DIRECT_URL=PostgreSQLのURL
AUTH_SECRET=bunx --bun auth secretで出力される値
HASH_SALT=パスワードをハッシュ化するときのソルト
SUPERADMIN_HASHED_PASSWORD=ハッシュ化したsuperadminのパスワード
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA" (Cloudflare Turnstileの公開鍵)
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA" (Cloudflare Turnstileの秘密鍵)
```

VSCodeでF5キー(or Fn+F5)でデバッグセッションを立ち上げるか、ターミナルで`bun run dev`を打ち込むと実行できます。

## Build & Start

同様に`.env`を保存して、

```shell
bun run build
bun run start
```

でビルドと実行ができます。
