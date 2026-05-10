/**
 * @user@host 形式に正規化する。
 * ローカルユーザー（hostなし）は自サーバーのドメインを補完する。
 */
export function normalizeAcct(username: string, host: string | null | undefined): string {
  const localHost = process.env.MISSKEY_HOST!;
  const h = host ?? localHost;
  return `@${username}@${h}`;
}

/**
 * メッセージテキストから送金先のacctとして "@user" や "@user@host" を抽出する。
 * ボット自身のメンションは除外する。
 */
export function parseTargetAcct(text: string, botUsername: string): string | null {
  const localHost = process.env.MISSKEY_HOST!;
  // @user@host または @user 形式にマッチ（ボット自身は除く）
  const matches = [...text.matchAll(/@([a-zA-Z0-9_.-]+)(?:@([a-zA-Z0-9_.-]+))?/g)];
  for (const m of matches) {
    const username = m[1];
    const host = m[2] ?? localHost;
    if (username.toLowerCase() === botUsername.toLowerCase() && host === localHost) continue;
    return `@${username}@${host}`;
  }
  return null;
}
