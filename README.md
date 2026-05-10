# misskey-money

Misskeyの通貨Bot。メンションまたはDMでコマンドを使用可能。フェデレーション対応（他サーバーのユーザーも利用可）。

## サーバーへの導入

### 前提条件

- Node.js 20以上
- pnpm（自動インストールされます）
- PM2（自動インストールされます）

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/yu-000/misskey-money.git
cd misskey-money

# 2. セットアップスクリプトを実行（初回は .env が作成されて止まります）
bash setup.sh

# 3. .env を編集
nano /opt/misskey-money/.env

# 4. 再度セットアップスクリプトを実行（インストール・起動）
bash setup.sh
```

### PM2 操作コマンド

```bash
pm2 status                    # 稼働状況確認
pm2 logs misskey-money        # リアルタイムログ
pm2 restart misskey-money     # 再起動
pm2 stop misskey-money        # 停止
```

### アップデート

```bash
cd /opt/misskey-money
git pull
pnpm install --frozen-lockfile
pnpm build
pm2 restart misskey-money
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `MISSKEY_HOST` | Botのサーバードメイン | 必須 |
| `MISSKEY_TOKEN` | BotアカウントのAPIトークン | 必須 |
| `INITIAL_BALANCE` | 初回登録時の残高 | `1000` |
| `DAILY_AMOUNT` | デイリーボーナス額 | `100` |
| `CURRENCY_NAME` | 通貨名 | `コイン` |

## APIトークンの取得

Misskeyの設定 → APIキー → 以下の権限を付与:
- ノートの作成・削除
- メッセージの送受信

## コマンド

| コマンド | 動作 |
|---------|------|
| `残高` / `balance` | 残高確認 |
| `デイリー` / `daily` | 1日1回ボーナス |
| `ランキング` / `ranking` | 上位10名 |
| `ヘルプ` / `help` | コマンド一覧 |

メンション例: `@bot@your.server 残高`
DM: botのアカウントに直接メッセージを送信
