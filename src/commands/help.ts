export function help(): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  return `📖 コマンド一覧 (メンションまたはDMで使用可能)

💰 残高 / balance
  自分の${currency}残高を確認

📤 送金 @ユーザー 金額 / send @user 金額
  他のユーザーに${currency}を送る
  例: 送金 @alice@example.com 100

🎁 デイリー / daily
  1日1回ボーナスを受け取る (${process.env.DAILY_AMOUNT ?? '100'} ${currency})

📊 ランキング / ranking
  上位10名の残高ランキングを表示

❓ ヘルプ / help
  このメッセージを表示`;
}
