import { getRanking } from '../db/users.js';

export function ranking(): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const rows = getRanking(10);
  if (rows.length === 0) return '📊 まだ誰もいません。';

  const medals = ['🥇', '🥈', '🥉'];
  const lines = rows.map((row, i) => {
    const medal = medals[i] ?? `${i + 1}.`;
    return `${medal} ${row.acct}  ${row.balance.toLocaleString()} ${currency}`;
  });

  return `📊 ランキング\n${lines.join('\n')}`;
}
