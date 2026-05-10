import type { MisskeyClient } from '../bot.js';

export async function replyToNote(
  client: MisskeyClient,
  noteId: string,
  senderAcct: string,
  text: string
): Promise<void> {
  await client.request('notes/create', {
    replyId: noteId,
    text: `${senderAcct} ${text}`,
    visibility: 'specified',
    visibleUserIds: [],
  });
}

export async function replyToDM(
  client: MisskeyClient,
  roomId: string,
  text: string
): Promise<void> {
  await client.request('messaging/messages/create', {
    groupId: null,
    userId: roomId,
    text,
  });
}
