import { MediaType } from '../../generated/prisma/enums';

export const WHATSAPP_PROVIDER = 'WHATSAPP_PROVIDER';

export interface OutboundMediaPayload {
  type: MediaType;
  filePath: string;
  mimeType: string;
  fileName: string;
  caption?: string;
}

export interface SendMessageResult {
  waMessageId: string;
}

/**
 * Contract for a WhatsApp connectivity backend. The only implementation
 * today is a QR-based personal WhatsApp Web session (Baileys) — this
 * interface exists so a different provider (e.g. an official Business API
 * integration) can be swapped in later without touching callers.
 */
export interface WhatsAppProvider {
  /**
   * Start (or resume) a session for this account. Resolves once the
   * connection attempt has been kicked off — QR codes and status changes
   * arrive asynchronously via WhatsAppQrEvent / WhatsAppStatusEvent.
   */
  connect(accountId: string): Promise<void>;

  /** Log out and permanently discard this account's session data. */
  disconnect(accountId: string): Promise<void>;

  /** True if there's a live, authenticated socket for this account. */
  isConnected(accountId: string): boolean;

  /** Send a plain text message. `to` is an E.164-style phone number. */
  sendTextMessage(
    accountId: string,
    to: string,
    text: string,
  ): Promise<SendMessageResult>;

  /** Send an image/video/audio/document, optionally with a caption. */
  sendMediaMessage(
    accountId: string,
    to: string,
    media: OutboundMediaPayload,
  ): Promise<SendMessageResult>;
}
