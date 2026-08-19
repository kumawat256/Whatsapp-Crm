import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CreditsModule } from '../credits/credits.module';
import { MediaModule } from '../media/media.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { InboxGateway } from './inbox.gateway';

@Module({
  imports: [JwtModule.register({}), MediaModule, WhatsAppModule, CreditsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, InboxGateway],
  exports: [ConversationsService],
})
export class InboxModule {}
