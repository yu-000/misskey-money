import { getBalance } from '../db/users.js';

export function balance(acct: string): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const bal = getBalance(acct);
  return `💰 残高: ${bal.toLocaleString()} ${currency}`;
}
