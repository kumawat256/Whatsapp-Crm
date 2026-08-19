import {
  MessageStatus,
  MessageType,
  WhatsAppAccountStatus,
} from '../../generated/prisma/enums';

export const WHATSAPP_QR_EVENT = 'whatsapp.qr';
export const WHATSAPP_STATUS_EVENT = 'whatsapp.status';
export const WHATSAPP_INCOMING_MESSAGE_EVENT = 'whatsapp.message.incoming';
export const WHATSAPP_MESSAGE_STATUS_EVENT = 'whatsapp.message.status';

export class WhatsAppQrEvent {
  constructor(
    public readonly accountId: string,
    public readonly qrDataUrl: string,
  ) {}
}

export class WhatsAppStatusEvent {
  constructor(
    public readonly accountId: string,
    public readonly status: WhatsAppAccountStatus,
    public readonly phoneNumber?: string,
  ) {}
}

export interface IncomingMessageMedia {
  buffer: Buffer;
  mimetype: string;
  fileName: string;
}

// Emitted by a provider when a new inbound message arrives. Media is
// already downloaded to a buffer — the provider owns protocol details,
// persistence (disk + DB) is the inbox service's job.
export class WhatsAppIncomingMessageEvent {
  constructor(
    public readonly accountId: string,
    public readonly fromPhoneNumber: string,
    public readonly waMessageId: string,
    public readonly type: MessageType,
    public readonly timestamp: Date,
    public readonly pushName?: string,
    public readonly text?: string,
    public readonly media?: IncomingMessageMedia,
  ) {}
}

// Emitted when an outbound message's delivery ack changes (sent -> delivered
// -> read) or fails.
export class WhatsAppMessageStatusEvent {
  constructor(
    public readonly accountId: string,
    public readonly waMessageId: string,
    public readonly status: MessageStatus,
  ) {}
}
