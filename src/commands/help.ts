export function help(): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const daily = process.env.DAILY_AMOUNT ?? '100';
  return `📖 コマンド一覧 (メンションまたはDMで使用可能)

💰 残高 / balance
  ${currency}残高を確認

🎁 デイリー / daily
  1日1回ボーナス (${daily}${currency}〜、連続日数でUP)

📊 ランキング / ranking
  上位10名の残高ランキング

🎴 おみくじ / fortune
  今日の運勢を占う

🧠 クイズ / quiz
  正解で+50 ${currency}

✏️ 答え A〜D / answer A〜D
  クイズに回答

❓ ヘルプ / help
  このメッセージを表示

✨ メッセージを送るだけでユニーク文字数×0.1${currency}獲得`;
}
