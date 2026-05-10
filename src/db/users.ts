import db from './index.js';

const INITIAL_BALANCE = parseInt(process.env.INITIAL_BALANCE ?? '1000', 10);

export interface UserRow {
  acct: string;
  balance: number;
  last_daily: string | null;
  streak: number;
  quiz_id: number | null;
  quiz_expires_at: string | null;
}

export function getOrCreate(acct: string): UserRow {
  const existing = db.prepare<[string], UserRow>(
    'SELECT * FROM users WHERE acct = ?'
  ).get(acct);
  if (existing) return existing;

  db.prepare('INSERT INTO users (acct, balance) VALUES (?, ?)').run(acct, INITIAL_BALANCE);
  return { acct, balance: INITIAL_BALANCE, last_daily: null, streak: 0, quiz_id: null, quiz_expires_at: null };
}

export function getBalance(acct: string): number {
  return getOrCreate(acct).balance;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function addBalance(acct: string, amount: number): number {
  getOrCreate(acct);
  db.prepare('UPDATE users SET balance = ROUND(balance + ?, 1) WHERE acct = ?').run(amount, acct);
  return getBalance(acct);
}

/** メッセージのユニーク文字数 × 0.1P を付与して獲得量を返す */
export function textReward(acct: string, text: string): number {
  const unique = new Set(text.replace(/\s/g, '')).size;
  if (unique === 0) return 0;
  const reward = round1(unique * 0.1);
  addBalance(acct, reward);
  return reward;
}

export function transfer(fromAcct: string, toAcct: string, amount: number): void {
  const now = new Date().toISOString();
  db.transaction(() => {
    getOrCreate(fromAcct);
    getOrCreate(toAcct);
    db.prepare('UPDATE users SET balance = ROUND(balance - ?, 1) WHERE acct = ?').run(amount, fromAcct);
    db.prepare('UPDATE users SET balance = ROUND(balance + ?, 1) WHERE acct = ?').run(amount, toAcct);
    db.prepare(
      'INSERT INTO transactions (from_acct, to_acct, amount, created_at) VALUES (?, ?, ?, ?)'
    ).run(fromAcct, toAcct, amount, now);
  })();
}

export function claimDaily(acct: string, baseAmount: number): { claimed: false } | { claimed: true; amount: number; streak: number } {
  const user = getOrCreate(acct);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (user.last_daily === today) return { claimed: false };

  const newStreak = user.last_daily === yesterday ? user.streak + 1 : 1;
  const streakBonus = Math.min((newStreak - 1) * 10, baseAmount * 2);
  const amount = baseAmount + streakBonus;

  db.prepare(
    'UPDATE users SET balance = ROUND(balance + ?, 1), last_daily = ?, streak = ? WHERE acct = ?'
  ).run(amount, today, newStreak, acct);

  return { claimed: true, amount, streak: newStreak };
}

export function getRanking(limit = 10): UserRow[] {
  return db.prepare<[number], UserRow>(
    'SELECT * FROM users ORDER BY balance DESC LIMIT ?'
  ).all(limit);
}

// --- Quiz ---

export function setQuiz(acct: string, quizId: number): void {
  getOrCreate(acct);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  db.prepare('UPDATE users SET quiz_id = ?, quiz_expires_at = ? WHERE acct = ?').run(quizId, expiresAt, acct);
}

export function getPendingQuiz(acct: string): { id: number } | null {
  const user = getOrCreate(acct);
  if (user.quiz_id == null || !user.quiz_expires_at) return null;
  if (new Date(user.quiz_expires_at) < new Date()) return null;
  return { id: user.quiz_id };
}

export function clearQuiz(acct: string): void {
  db.prepare('UPDATE users SET quiz_id = NULL, quiz_expires_at = NULL WHERE acct = ?').run(acct);
}
