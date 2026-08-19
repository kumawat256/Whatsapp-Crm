import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PERMISSIONS } from '../common/permissions';
import { JwtAccessPayload } from '../auth/types/jwt-payload.type';
import {
  WHATSAPP_QR_EVENT,
  WHATSAPP_STATUS_EVENT,
  WhatsAppQrEvent,
  WhatsAppStatusEvent,
} from './events/whatsapp.events';

@WebSocketGateway({ namespace: 'whatsapp' })
export class WhatsAppGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(WhatsAppGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtAccessPayload>(
        token,
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        },
      );
      if (!payload.permissions.includes(PERMISSIONS.WHATSAPP_MANAGE)) {
        client.disconnect(true);
        return;
      }
      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, accountId: string) {
    void client.join(accountId);
  }

  @OnEvent(WHATSAPP_QR_EVENT)
  handleQr(event: WhatsAppQrEvent) {
    this.server.to(event.accountId).emit('qr', { qrDataUrl: event.qrDataUrl });
  }

  @OnEvent(WHATSAPP_STATUS_EVENT)
  handleStatus(event: WhatsAppStatusEvent) {
    this.server
      .to(event.accountId)
      .emit('status', { status: event.status, phoneNumber: event.phoneNumber });
  }
}
