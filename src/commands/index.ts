import { balance } from './balance.js';
import { send } from './send.js';
import { daily } from './daily.js';
import { ranking } from './ranking.js';
import { help } from './help.js';

export interface CommandContext {
  acct: string;
  text: string;
  botUsername: string;
}

export function dispatch(ctx: CommandContext): string | null {
  // ボットへのメンション部分を除去して本文だけ取り出す
  const cleaned = ctx.text
    .replace(/@[a-zA-Z0-9_.-]+(?:@[a-zA-Z0-9_.-]+)?/g, (m) => {
      // ボット自身のメンションだけ除去
      const localHost = process.env.MISSKEY_HOST!;
      const parts = m.slice(1).split('@');
      const user = parts[0];
      const host = parts[1] ?? localHost;
      if (user.toLowerCase() === ctx.botUsername.toLowerCase() && host === localHost) return '';
      return m;
    })
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  const cmd = parts[0]?.toLowerCase() ?? '';
  const args = parts.slice(1);

  switch (cmd) {
    case '残高':
    case 'balance':
      return balance(ctx.acct);

    case '送金':
    case 'send':
      return send(ctx.acct, args, ctx.botUsername);

    case 'デイリー':
    case 'daily':
      return daily(ctx.acct);

    case 'ランキング':
    case 'ranking':
      return ranking();

    case 'ヘルプ':
    case 'help':
      return help();

    default:
      return null;
  }
}
