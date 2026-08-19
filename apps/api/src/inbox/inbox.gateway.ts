import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PERMISSIONS } from '../common/permissions';
import { JwtAccessPayload } from '../auth/types/jwt-payload.type';
import {
  INBOX_CONVERSATION_EVENT,
  INBOX_MESSAGE_EVENT,
  InboxConversationEvent,
  InboxMessageEvent,
} from './events/inbox.events';

@WebSocketGateway({ namespace: 'inbox' })
export class InboxGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

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
      if (!payload.permissions.includes(PERMISSIONS.MESSAGES_MANAGE)) {
        client.disconnect(true);
        return;
      }
      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  @OnEvent(INBOX_MESSAGE_EVENT)
  handleMessage(event: InboxMessageEvent) {
    this.server.emit('message', event.message);
  }

  @OnEvent(INBOX_CONVERSATION_EVENT)
  handleConversation(event: InboxConversationEvent) {
    this.server.emit('conversation', event.conversation);
  }
}
