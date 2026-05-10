import WebSocket from 'ws';
import { dispatch } from './commands/index.js';
import { normalizeAcct } from './utils/acct.js';

export interface MisskeyClient {
  request(endpoint: string, params?: Record<string, unknown>): Promise<unknown>;
}

interface BotConfig {
  host: string;
  token: string;
}

function createApiClient(config: BotConfig): MisskeyClient {
  return {
    async request(endpoint, params = {}) {
      const url = `https://${config.host}/api/${endpoint}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ i: config.token, ...params }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`);
      return res.json();
    },
  };
}

async function getBotInfo(client: MisskeyClient): Promise<{ id: string; username: string }> {
  const me = await client.request('i') as { id: string; username: string };
  return me;
}

async function sendNote(
  client: MisskeyClient,
  text: string,
  options: {
    replyId?: string;
    visibility?: string;
    visibleUserIds?: string[];
  } = {}
): Promise<void> {
  await client.request('notes/create', {
    text,
    visibility: options.visibility ?? 'specified',
    replyId: options.replyId,
    visibleUserIds: options.visibleUserIds ?? [],
  });
}

async function sendDM(
  client: MisskeyClient,
  userId: string,
  text: string
): Promise<void> {
  await client.request('messaging/messages/create', {
    userId,
    text,
  });
}

function connectStreaming(config: BotConfig, onMessage: (data: unknown) => void): void {
  const wsUrl = `wss://${config.host}/streaming?i=${config.token}`;
  let ws: WebSocket;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('[bot] Streaming connected');
      // メインチャンネル購読（メンション受信）
      ws.send(JSON.stringify({
        type: 'connect',
        body: { channel: 'main', id: 'main' },
      }));
      // ダイレクトメッセージ購読
      ws.send(JSON.stringify({
        type: 'connect',
        body: { channel: 'messagingIndex', id: 'messaging' },
      }));
    });

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        onMessage(data);
      } catch {
        // ignore parse errors
      }
    });

    ws.on('close', () => {
      console.log('[bot] Streaming disconnected, reconnecting in 5s...');
      setTimeout(connect, 5000);
    });

    ws.on('error', (err) => {
      console.error('[bot] WebSocket error:', err.message);
    });
  }

  connect();
}

export async function startBot(config: BotConfig): Promise<void> {
  const client = createApiClient(config);
  const botInfo = await getBotInfo(client);
  const botAcct = normalizeAcct(botInfo.username, config.host);
  console.log(`[bot] Logged in as ${botAcct}`);

  connectStreaming(config, async (data: unknown) => {
    const msg = data as {
      type: string;
      body?: {
        type?: string;
        body?: {
          // mention / note
          id?: string;
          text?: string;
          user?: { id: string; username: string; host: string | null };
          // messaging
          userId?: string;
          message?: { id: string; text: string; userId: string; user?: { username: string; host: string | null } };
        };
      };
    };

    if (msg.type !== 'channel') return;
    const channelBody = msg.body;
    if (!channelBody) return;

    // ---- メンション処理 ----
    if (channelBody.type === 'mention') {
      const note = channelBody.body;
      if (!note?.id || !note.text || !note.user) return;

      const senderAcct = normalizeAcct(note.user.username, note.user.host);
      const text = note.text.replace(/<[^>]+>/g, '').trim(); // HTML除去

      const result = dispatch({ acct: senderAcct, text, botUsername: botInfo.username });
      if (!result) return;

      await sendNote(client, `${senderAcct} ${result}`, {
        replyId: note.id,
        visibleUserIds: [note.user.id],
      }).catch(err => console.error('[bot] sendNote error:', err));
      return;
    }

    // ---- DMメッセージ処理 ----
    if (channelBody.type === 'message') {
      const msgData = channelBody.body?.message;
      if (!msgData?.text || !msgData.user) return;

      const senderAcct = normalizeAcct(msgData.user.username, msgData.user.host ?? null);
      const text = msgData.text.trim();

      const result = dispatch({ acct: senderAcct, text, botUsername: botInfo.username });
      if (!result) return;

      await sendDM(client, msgData.userId, result)
        .catch(err => console.error('[bot] sendDM error:', err));
    }
  });
}
