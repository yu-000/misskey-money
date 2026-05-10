import 'dotenv/config';
import { startBot } from './bot.js';

const host = process.env.MISSKEY_HOST;
const token = process.env.MISSKEY_TOKEN;

if (!host || !token) {
  console.error('環境変数 MISSKEY_HOST と MISSKEY_TOKEN を設定してください。');
  process.exit(1);
}

startBot({ host, token }).catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
