import { balance } from './balance.js';
import { send } from './send.js';
import { daily } from './daily.js';
import { ranking } from './ranking.js';
import { help } from './help.js';
import { fortune } from './fortune.js';
import { quiz, answer } from './quiz.js';
import { textReward } from '../db/users.js';

export interface CommandContext {
  acct: string;
  text: string;
  botUsername: string;
}

export function dispatch(ctx: CommandContext): string | null {
  const localHost = process.env.MISSKEY_HOST!;

  // ボット自身のメンションを除去して本文を取り出す
  const cleaned = ctx.text
    .replace(/@[a-zA-Z0-9_.-]+(?:@[a-zA-Z0-9_.-]+)?/g, (m) => {
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

  // ユニーク文字ポイントを付与（コマンドテキスト全体を対象）
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const earned = textReward(ctx.acct, cleaned);
  const earnedSuffix = earned > 0
    ? `\n✏️ +${earned} ${currency} (${new Set(cleaned.replace(/\s/g, '')).size}文字)`
    : '';

  let result: string | null = null;

  switch (cmd) {
    case '残高':
    case 'balance':
      result = balance(ctx.acct);
      break;

    case '送金':
    case 'send':
      result = send(ctx.acct, args, ctx.botUsername);
      break;

    case 'デイリー':
    case 'daily':
      result = daily(ctx.acct);
      break;

    case 'ランキング':
    case 'ranking':
      result = ranking();
      break;

    case 'おみくじ':
    case 'fortune':
      result = fortune();
      break;

    case 'クイズ':
    case 'quiz':
      result = quiz(ctx.acct);
      break;

    case '答え':
    case 'answer':
      result = answer(ctx.acct, args);
      break;

    case 'ヘルプ':
    case 'help':
      result = help();
      break;

    default:
      // コマンド不明でもテキスト報酬だけ返す
      if (earned > 0) result = earnedSuffix.trim();
      break;
  }

  if (result === null) return null;

  // おみくじ・ランキング・ヘルプはsuffixなし（P無関係 or 表示が崩れるため）
  const noSuffix = ['おみくじ', 'fortune', 'ランキング', 'ranking', 'ヘルプ', 'help'].includes(cmd);
  return noSuffix ? result : result + earnedSuffix;
}
