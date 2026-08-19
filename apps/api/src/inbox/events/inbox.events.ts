export const INBOX_MESSAGE_EVENT = 'inbox.message';
export const INBOX_CONVERSATION_EVENT = 'inbox.conversation';

// Payloads are plain Prisma result shapes (already serializable), not typed
// classes — the gateway just forwards them over the socket as-is.
export class InboxMessageEvent {
  constructor(public readonly message: unknown) {}
}

export class InboxConversationEvent {
  constructor(public readonly conversation: unknown) {}
}
