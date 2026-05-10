const FORTUNES = [
  { label: '大吉', messages: ['最高の運気！何事も思い通りに進みます。', '絶好調！チャンスを逃さずに。'] },
  { label: '中吉', messages: ['良い流れが続いています。積極的に行動を。', '努力が実を結ぶ兆しあり。'] },
  { label: '小吉', messages: ['小さな幸運が積み重なる日。', 'ちょっとした出会いに注目。'] },
  { label: '末吉', messages: ['焦らずじっくりと進めましょう。', '今は準備の時。チャンスはあとから来る。'] },
  { label: '凶',   messages: ['慎重に行動しましょう。無理は禁物。', '今日は休養日にするのが吉かも。'] },
  { label: '大凶', messages: ['試練の日。でも乗り越えれば大きく成長できます。', '一歩引いて周りを見渡して。'] },
];

// 大吉が出やすい重み付け
const WEIGHTS = [15, 30, 25, 20, 8, 2];

export function fortune(): string {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  let index = 0;
  for (let i = 0; i < WEIGHTS.length; i++) {
    rand -= WEIGHTS[i];
    if (rand <= 0) { index = i; break; }
  }

  const f = FORTUNES[index];
  const msg = f.messages[Math.floor(Math.random() * f.messages.length)];
  const emoji = ['🎊', '✨', '🌸', '🍀', '😶', '💀'][index];

  return `${emoji} 今日の運勢: **${f.label}**\n${msg}`;
}
