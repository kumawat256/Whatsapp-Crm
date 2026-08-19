import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BaileysWhatsAppProvider } from './providers/baileys-whatsapp.provider';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppGateway } from './whatsapp.gateway';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    WhatsAppGateway,
    { provide: WHATSAPP_PROVIDER, useClass: BaileysWhatsAppProvider },
  ],
  exports: [WHATSAPP_PROVIDER],
})
export class WhatsAppModule {}
