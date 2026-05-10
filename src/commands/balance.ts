import { getBalance } from '../db/users.js';

export function balance(acct: string): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const bal = getBalance(acct);
  const display = Number.isInteger(bal) ? bal.toLocaleString() : bal.toFixed(1);
  return `💰 残高: ${display} ${currency}`;
}
