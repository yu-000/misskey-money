import { getOrCreate, transfer } from '../db/users.js';
import { parseTargetAcct } from '../utils/acct.js';

export function send(fromAcct: string, args: string[], botUsername: string): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';

  // args は ["@target" または "@target@host", "金額"] を想定
  // テキスト全体から対象acctを抽出
  const rawText = args.join(' ');
  const toAcct = parseTargetAcct(rawText, botUsername);
  if (!toAcct) return '❌ 送金先のユーザーを指定してください。\n例: 送金 @alice 100';

  const amountStr = args.find(a => /^\d+$/.test(a));
  const amount = amountStr ? parseInt(amountStr, 10) : NaN;
  if (!amount || amount <= 0) return '❌ 正しい金額を指定してください。\n例: 送金 @alice 100';

  if (fromAcct === toAcct) return '❌ 自分自身には送金できません。';

  const sender = getOrCreate(fromAcct);
  if (sender.balance < amount) {
    return `❌ 残高が足りません。(残高: ${sender.balance.toLocaleString()} ${currency})`;
  }

  transfer(fromAcct, toAcct, amount);
  const newBalance = sender.balance - amount;
  return `✅ ${toAcct} に ${amount.toLocaleString()} ${currency} を送金しました。\n残高: ${newBalance.toLocaleString()} ${currency}`;
}
