#!/bin/bash
set -e

INSTALL_DIR="/opt/misskey-money"

echo "=== misskey-money セットアップ ==="

# Node.js 確認
if ! command -v node &>/dev/null; then
  echo "[エラー] Node.js がインストールされていません。"
  echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "  sudo apt install -y nodejs"
  exit 1
fi

# pnpm 確認・インストール
if ! command -v pnpm &>/dev/null; then
  echo "[info] pnpm をインストールします..."
  npm install -g pnpm
fi

# PM2 確認・インストール
if ! command -v pm2 &>/dev/null; then
  echo "[info] PM2 をインストールします..."
  npm install -g pm2
fi

# インストール先にコピー
echo "[info] $INSTALL_DIR にファイルをコピーします..."
sudo mkdir -p "$INSTALL_DIR"
sudo cp -r . "$INSTALL_DIR/"
sudo chown -R "$USER":"$USER" "$INSTALL_DIR"

cd "$INSTALL_DIR"

# .env が未作成なら作成を促す
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "================================================================"
  echo "  .env ファイルを編集してから再度このスクリプトを実行してください"
  echo "  nano $INSTALL_DIR/.env"
  echo "================================================================"
  exit 0
fi

# 依存パッケージインストール・ビルド
echo "[info] 依存パッケージをインストールします..."
pnpm install

echo "[info] ビルドします..."
pnpm build

mkdir -p logs data

# PM2 で起動
echo "[info] PM2 で起動します..."
pm2 start ecosystem.config.json
pm2 save

# OS起動時に自動起動
pm2 startup | tail -1 | bash || true

echo ""
echo "=== 完了 ==="
echo "  状態確認: pm2 status"
echo "  ログ確認: pm2 logs misskey-money"
echo "  停止:     pm2 stop misskey-money"
echo "  再起動:   pm2 restart misskey-money"
