# misskey-money

Misskeyの通貨Bot。メンションまたはDMでコマンドを使用可能。フェデレーション対応（他サーバーのユーザーも利用可）。

## セットアップ

```bash
cp .env.example .env
# .env を編集して MISSKEY_HOST と MISSKEY_TOKEN を設定

pnpm install
pnpm build
pnpm start
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `MISSKEY_HOST` | BotのサーバードメIN | 必須 |
| `MISSKEY_TOKEN` | BotアカウントのAPIトークン | 必須 |
| `INITIAL_BALANCE` | 初回登録時の残高 | `1000` |
| `DAILY_AMOUNT` | デイリーボーナス額 | `100` |
| `CURRENCY_NAME` | 通貨名 | `コイン` |

## コマンド

| コマンド | 動作 |
|---------|------|
| `残高` / `balance` | 残高確認 |
| `送金 @user 金額` / `send @user 金額` | 送金 |
| `デイリー` / `daily` | 1日1回ボーナス |
| `ランキング` / `ranking` | 上位10名 |
| `ヘルプ` / `help` | コマンド一覧 |

## APIトークンの取得

Misskeyの設定 → APIキー → 「ノートの作成・削除」「メッセージの送受信」権限を付与。
