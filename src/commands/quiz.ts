import { setQuiz, getPendingQuiz, clearQuiz, addBalance, getBalance } from '../db/users.js';

const QUIZ_REWARD = 50;

interface Question {
  id: number;
  question: string;
  choices: { a: string; b: string; c: string; d: string };
  answer: 'a' | 'b' | 'c' | 'd';
}

const QUESTIONS: Question[] = [
  {
    id: 0,
    question: '富士山の標高は？',
    choices: { a: '3,193m', b: '3,456m', c: '3,776m', d: '4,012m' },
    answer: 'c',
  },
  {
    id: 1,
    question: '日本の都道府県は全部でいくつ？',
    choices: { a: '43', b: '47', c: '50', d: '52' },
    answer: 'b',
  },
  {
    id: 2,
    question: '水の化学式は？',
    choices: { a: 'H2O', b: 'CO2', c: 'NaCl', d: 'O2' },
    answer: 'a',
  },
  {
    id: 3,
    question: '太陽系で最も大きい惑星は？',
    choices: { a: '土星', b: '天王星', c: '海王星', d: '木星' },
    answer: 'd',
  },
  {
    id: 4,
    question: '虹は何色？',
    choices: { a: '5色', b: '7色', c: '8色', d: '6色' },
    answer: 'b',
  },
  {
    id: 5,
    question: '光の速さは約？',
    choices: { a: '10万km/s', b: '20万km/s', c: '30万km/s', d: '40万km/s' },
    answer: 'c',
  },
  {
    id: 6,
    question: '人体で最も大きい臓器は？',
    choices: { a: '肝臓', b: '皮膚', c: '肺', d: '小腸' },
    answer: 'b',
  },
  {
    id: 7,
    question: 'DNAを構成する塩基の種類は？',
    choices: { a: '4種類', b: '3種類', c: '5種類', d: '2種類' },
    answer: 'a',
  },
  {
    id: 8,
    question: '地球から月までの距離は約？',
    choices: { a: '38万km', b: '15万km', c: '80万km', d: '100万km' },
    answer: 'a',
  },
  {
    id: 9,
    question: '1年は何秒？',
    choices: { a: '約1,500万秒', b: '約3,154万秒', c: '約5,000万秒', d: '約8,000万秒' },
    answer: 'b',
  },
];

export function quiz(acct: string): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  setQuiz(acct, q.id);

  return `🧠 クイズ！正解で +${QUIZ_REWARD} ${currency}\n\n` +
    `Q. ${q.question}\n\n` +
    `A. ${q.choices.a}\n` +
    `B. ${q.choices.b}\n` +
    `C. ${q.choices.c}\n` +
    `D. ${q.choices.d}\n\n` +
    `「答え A」のように送信してください（30分以内）`;
}

export function answer(acct: string, args: string[]): string {
  const currency = process.env.CURRENCY_NAME ?? 'コイン';
  const pending = getPendingQuiz(acct);
  if (!pending) return '❓ 現在出題中のクイズがありません。「クイズ」で挑戦！';

  const input = args[0]?.toLowerCase();
  if (!['a', 'b', 'c', 'd'].includes(input ?? '')) {
    return '❌ A / B / C / D のいずれかで答えてください。';
  }

  const q = QUESTIONS.find(q => q.id === pending.id)!;
  clearQuiz(acct);

  if (input === q.answer) {
    addBalance(acct, QUIZ_REWARD);
    const bal = getBalance(acct);
    return `✅ 正解！+${QUIZ_REWARD} ${currency}\n残高: ${formatBal(bal)} ${currency}`;
  } else {
    return `❌ 不正解…正解は **${q.answer.toUpperCase()}. ${q.choices[q.answer]}** でした。`;
  }
}

function formatBal(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1);
}
