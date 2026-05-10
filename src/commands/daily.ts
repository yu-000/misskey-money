import { claimDaily, getBalance } from '../db/users.js';

export function daily(acct: string): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const amount = parseInt(process.env.DAILY_AMOUNT ?? '100', 10);

  const claimed = claimDaily(acct, amount);
  if (!claimed) {
    return `⏰ 本日のボーナスはすでに受け取り済みです。また明日どうぞ！`;
  }

  const bal = getBalance(acct);
  return `🎁 デイリーボーナス +${amount.toLocaleString()} ${currency}！\n残高: ${bal.toLocaleString()} ${currency}`;
}
