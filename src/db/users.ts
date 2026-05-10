import db from './index.js';

const INITIAL_BALANCE = parseInt(process.env.INITIAL_BALANCE ?? '1000', 10);

export interface UserRow {
  acct: string;
  balance: number;
  last_daily: string | null;
}

export function getOrCreate(acct: string): UserRow {
  const existing = db.prepare<[string], UserRow>(
    'SELECT * FROM users WHERE acct = ?'
  ).get(acct);
  if (existing) return existing;

  db.prepare('INSERT INTO users (acct, balance) VALUES (?, ?)').run(acct, INITIAL_BALANCE);
  return { acct, balance: INITIAL_BALANCE, last_daily: null };
}

export function getBalance(acct: string): number {
  return getOrCreate(acct).balance;
}

export function transfer(fromAcct: string, toAcct: string, amount: number): void {
  const now = new Date().toISOString();
  db.transaction(() => {
    getOrCreate(fromAcct);
    getOrCreate(toAcct);
    db.prepare('UPDATE users SET balance = balance - ? WHERE acct = ?').run(amount, fromAcct);
    db.prepare('UPDATE users SET balance = balance + ? WHERE acct = ?').run(amount, toAcct);
    db.prepare(
      'INSERT INTO transactions (from_acct, to_acct, amount, created_at) VALUES (?, ?, ?, ?)'
    ).run(fromAcct, toAcct, amount, now);
  })();
}

export function claimDaily(acct: string, amount: number): boolean {
  const user = getOrCreate(acct);
  const today = new Date().toISOString().slice(0, 10);
  if (user.last_daily === today) return false;

  db.prepare('UPDATE users SET balance = balance + ?, last_daily = ? WHERE acct = ?').run(
    amount, today, acct
  );
  return true;
}

export function getRanking(limit = 10): UserRow[] {
  return db.prepare<[number], UserRow>(
    'SELECT * FROM users ORDER BY balance DESC LIMIT ?'
  ).all(limit);
}
