import { claimDaily, getBalance } from '../db/users.js';

export function daily(acct: string): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const base = parseInt(process.env.DAILY_AMOUNT ?? '100', 10);

  const result = claimDaily(acct, base);
  if (!result.claimed) {
    return '⏰ 本日のボーナスはすでに受け取り済みです。また明日どうぞ！';
  }

  const bal = getBalance(acct);
  const streakMsg = result.streak >= 2 ? `\n🔥 ${result.streak}日連続！ボーナス +${result.amount - base}${currency}` : '';
  return `🎁 デイリーボーナス +${result.amount} ${currency}！${streakMsg}\n残高: ${formatBal(bal)} ${currency}`;
}

function formatBal(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1);
}
