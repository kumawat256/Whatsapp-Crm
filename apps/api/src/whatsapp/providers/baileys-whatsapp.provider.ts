import { readFile, rm } from 'node:fs/promises';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  getContentType,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import type { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import { pino } from 'pino';
import {
  MessageStatus,
  MessageType,
  WhatsAppAccountStatus,
} from '../../generated/prisma/enums';
import { resolveStoragePath } from '../../common/storage-path.util';
import {
  OutboundMediaPayload,
  SendMessageResult,
  WhatsAppProvider,
} from '../interfaces/whatsapp-provider.interface';
import { useEncryptedFileAuthState } from '../session-store/encrypted-file-auth-state';
import { jidToPhone, phoneToJid } from '../jid.util';
import {
  IncomingMessageMedia,
  WHATSAPP_INCOMING_MESSAGE_EVENT,
  WHATSAPP_MESSAGE_STATUS_EVENT,
  WHATSAPP_QR_EVENT,
  WHATSAPP_STATUS_EVENT,
  WhatsAppIncomingMessageEvent,
  WhatsAppMessageStatusEvent,
  WhatsAppQrEvent,
  WhatsAppStatusEvent,
} from '../events/whatsapp.events';

const baileysLogger = pino({ level: 'silent' });

const ACK_STATUS_MAP: Record<number, MessageStatus> = {
  0: MessageStatus.FAILED, // ERROR
  1: MessageStatus.SENT, // PENDING (queued on WA's servers)
  2: MessageStatus.SENT, // SERVER_ACK
  3: MessageStatus.DELIVERED, // DELIVERY_ACK
  4: MessageStatus.READ, // READ
  5: MessageStatus.READ, // PLAYED
};

@Injectable()
export class BaileysWhatsAppProvider
  implements WhatsAppProvider, OnModuleDestroy
{
  private readonly logger = new Logger(BaileysWhatsAppProvider.name);
  private readonly sockets = new Map<string, WASocket>();

  constructor(
    private readonly events: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  async connect(accountId: string): Promise<void> {
    if (this.sockets.has(accountId)) {
      return;
    }

    const sessionDir = this.sessionDir(accountId);
    const { state, saveCreds } = await useEncryptedFileAuthState(
      sessionDir,
      this.encryptionKey(),
    );
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: baileysLogger,
      printQRInTerminal: false,
    });
    this.sockets.set(accountId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      void this.handleConnectionUpdate(accountId, sessionDir, sock, update);
    });

    sock.ev.on('messages.upsert', (payload) => {
      if (payload.type !== 'notify') return;
      for (const msg of payload.messages) {
        // Whitelist, not blacklist: only a real 1:1 personal-chat JID
        // (<number>@s.whatsapp.net) is ever a phone number we can act on.
        // Baileys surfaces plenty of other remoteJid shapes through this
        // same event — group chats (@g.us), status/story activity
        // (status@broadcast), broadcast lists (@broadcast), channels
        // (@newsletter), and @lid ("Linked ID", WhatsApp's newer privacy
        // identifier — every inbound message is delivered twice during
        // this rollout, once by @lid and once by the real phone-number
        // JID, both carrying the *same* msg.key.id, so the @lid copy is
        // just a duplicate to skip). jidToPhone() blindly treats whatever
        // precedes '@' as a phone number, so letting any of these through
        // fabricates a garbage "contact" like phone number "+status".
        if (msg.key.fromMe || !msg.key.remoteJid?.endsWith('@s.whatsapp.net')) {
          continue;
        }
        void this.processIncomingMessage(accountId, msg);
      }
    });

    sock.ev.on('messages.update', (updates) => {
      for (const { key, update } of updates) {
        if (!key.id || update.status === undefined || update.status === null)
          continue;
        const status = ACK_STATUS_MAP[update.status];
        if (!status) continue;
        this.events.emit(
          WHATSAPP_MESSAGE_STATUS_EVENT,
          new WhatsAppMessageStatusEvent(accountId, key.id, status),
        );
      }
    });
  }

  async disconnect(accountId: string): Promise<void> {
    const sock = this.sockets.get(accountId);
    if (sock) {
      await sock.logout().catch((err: unknown) => {
        this.logger.warn(
          `logout() failed for account ${accountId}: ${String(err)}`,
        );
      });
      sock.end(undefined);
      this.sockets.delete(accountId);
    }

    await rm(this.sessionDir(accountId), { recursive: true, force: true });
    this.events.emit(
      WHATSAPP_STATUS_EVENT,
      new WhatsAppStatusEvent(accountId, WhatsAppAccountStatus.LOGGED_OUT),
    );
  }

  isConnected(accountId: string): boolean {
    return !!this.sockets.get(accountId)?.user;
  }

  async sendTextMessage(
    accountId: string,
    to: string,
    text: string,
  ): Promise<SendMessageResult> {
    const sock = this.requireSocket(accountId);
    const jid = await this.resolveJid(sock, to);
    const result = await sock.sendMessage(jid, { text });
    return { waMessageId: this.requireMessageId(result) };
  }

  async sendMediaMessage(
    accountId: string,
    to: string,
    media: OutboundMediaPayload,
  ): Promise<SendMessageResult> {
    const sock = this.requireSocket(accountId);
    const buffer = await readFile(media.filePath);
    const jid = await this.resolveJid(sock, to);

    const result = await (() => {
      switch (media.type) {
        case 'IMAGE':
          return sock.sendMessage(jid, {
            image: buffer,
            caption: media.caption,
          });
        case 'VIDEO':
          return sock.sendMessage(jid, {
            video: buffer,
            caption: media.caption,
          });
        case 'AUDIO':
          return sock.sendMessage(jid, {
            audio: buffer,
            mimetype: media.mimeType,
          });
        case 'DOCUMENT':
          return sock.sendMessage(jid, {
            document: buffer,
            mimetype: media.mimeType,
            fileName: media.fileName,
            caption: media.caption,
          });
      }
    })();

    return { waMessageId: this.requireMessageId(result) };
  }

  onModuleDestroy() {
    for (const sock of this.sockets.values()) {
      sock.end(undefined);
    }
    this.sockets.clear();
  }

  private requireSocket(accountId: string): WASocket {
    const sock = this.sockets.get(accountId);
    if (!sock || !sock.user) {
      throw new Error('WhatsApp account is not connected');
    }
    return sock;
  }

  // Baileys' sendMessage() happily "succeeds" (returns a message key) even
  // against a malformed or unregistered JID — e.g. a phone number saved
  // without its country code produces a JID that looks plausible but isn't
  // any real WhatsApp account, and the message silently goes nowhere.
  // onWhatsApp() actually queries WhatsApp's servers first: it returns the
  // canonical jid when the number is registered, and omits it entirely
  // (not a falsy `exists` flag — the entry just isn't in the array) when
  // it isn't, which is the only way to catch this before pretending SENT.
  private async resolveJid(
    sock: WASocket,
    phoneNumber: string,
  ): Promise<string> {
    const results = await sock.onWhatsApp(phoneToJid(phoneNumber));
    const match = results?.[0];
    if (!match) {
      throw new Error(
        `${phoneNumber} does not appear to be a registered WhatsApp number`,
      );
    }
    return match.jid;
  }

  private requireMessageId(message: WAMessage | undefined): string {
    if (!message?.key.id) {
      throw new Error('WhatsApp did not return a message id');
    }
    return message.key.id;
  }

  private async processIncomingMessage(accountId: string, msg: WAMessage) {
    const content = msg.message;
    if (!content) return;

    const contentType = getContentType(content);
    let type: MessageType;
    let text: string | undefined;
    let media: IncomingMessageMedia | undefined;

    try {
      switch (contentType) {
        case 'conversation':
          type = MessageType.TEXT;
          text = content.conversation ?? undefined;
          break;
        case 'extendedTextMessage':
          type = MessageType.TEXT;
          text = content.extendedTextMessage?.text ?? undefined;
          break;
        case 'imageMessage':
          type = MessageType.IMAGE;
          text = content.imageMessage?.caption ?? undefined;
          media = await this.downloadIncomingMedia(
            msg,
            content.imageMessage?.mimetype ?? 'image/jpeg',
            'image',
          );
          break;
        case 'videoMessage':
          type = MessageType.VIDEO;
          text = content.videoMessage?.caption ?? undefined;
          media = await this.downloadIncomingMedia(
            msg,
            content.videoMessage?.mimetype ?? 'video/mp4',
            'video',
          );
          break;
        case 'audioMessage':
          type = MessageType.AUDIO;
          media = await this.downloadIncomingMedia(
            msg,
            content.audioMessage?.mimetype ?? 'audio/ogg',
            'audio',
          );
          break;
        case 'documentMessage':
          type = MessageType.DOCUMENT;
          text = content.documentMessage?.caption ?? undefined;
          media = await this.downloadIncomingMedia(
            msg,
            content.documentMessage?.mimetype ?? 'application/octet-stream',
            content.documentMessage?.fileName ?? 'document',
          );
          break;
        default:
          // Unsupported content (sticker, location, poll, reaction, ...) —
          // out of scope for this phase.
          return;
      }
    } catch (err) {
      this.logger.warn(
        `Failed to process incoming message ${msg.key.id}: ${String(err)}`,
      );
      return;
    }

    if (!msg.key.remoteJid || !msg.key.id) return;

    const timestampSeconds = Number(msg.messageTimestamp) || Date.now() / 1000;
    this.events.emit(
      WHATSAPP_INCOMING_MESSAGE_EVENT,
      new WhatsAppIncomingMessageEvent(
        accountId,
        jidToPhone(msg.key.remoteJid),
        msg.key.id,
        type,
        new Date(timestampSeconds * 1000),
        msg.pushName ?? undefined,
        text,
        media,
      ),
    );
  }

  private async downloadIncomingMedia(
    msg: WAMessage,
    mimetype: string,
    fileName: string,
  ): Promise<IncomingMessageMedia> {
    const buffer = await downloadMediaMessage(msg, 'buffer', {});
    return { buffer, mimetype, fileName };
  }

  private async handleConnectionUpdate(
    accountId: string,
    sessionDir: string,
    sock: WASocket,
    update: Partial<{
      connection: string;
      qr: string;
      lastDisconnect: { error?: Error };
    }>,
  ) {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      const qrDataUrl = await QRCode.toDataURL(qr);
      this.events.emit(
        WHATSAPP_QR_EVENT,
        new WhatsAppQrEvent(accountId, qrDataUrl),
      );
      this.events.emit(
        WHATSAPP_STATUS_EVENT,
        new WhatsAppStatusEvent(accountId, WhatsAppAccountStatus.CONNECTING),
      );
    }

    if (connection === 'open') {
      const phoneNumber = sock.user?.id?.split(':')[0]?.split('@')[0];
      this.events.emit(
        WHATSAPP_STATUS_EVENT,
        new WhatsAppStatusEvent(
          accountId,
          WhatsAppAccountStatus.CONNECTED,
          phoneNumber,
        ),
      );
    }

    if (connection === 'close') {
      this.sockets.delete(accountId);
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output
        ?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      if (loggedOut) {
        await rm(sessionDir, { recursive: true, force: true });
        this.events.emit(
          WHATSAPP_STATUS_EVENT,
          new WhatsAppStatusEvent(accountId, WhatsAppAccountStatus.LOGGED_OUT),
        );
      } else if (statusCode === DisconnectReason.restartRequired) {
        // Not a failure — this is a mandatory step of the QR pairing
        // handshake itself. Baileys saves the newly-scanned credentials via
        // creds.update, then always closes the socket with 515 and expects
        // the caller to open a fresh socket reusing those same credentials
        // to actually reach `connection: 'open'`. Without this, a freshly
        // scanned QR code would look like it hung forever at "connecting"
        // and never transition to CONNECTED.
        await this.connect(accountId);
      } else {
        // Any other close (network blip, etc.) just drops the live socket —
        // an admin reconnects from the UI, which reuses the still-valid
        // session on disk instead of a fresh QR pairing.
        this.events.emit(
          WHATSAPP_STATUS_EVENT,
          new WhatsAppStatusEvent(
            accountId,
            WhatsAppAccountStatus.DISCONNECTED,
          ),
        );
      }
    }
  }

  private sessionDir(accountId: string): string {
    return resolveStoragePath(this.config, 'wa-sessions', accountId);
  }

  private encryptionKey(): Buffer {
    return Buffer.from(
      this.config.get<string>('SESSION_ENCRYPTION_KEY')!,
      'hex',
    );
  }
}
