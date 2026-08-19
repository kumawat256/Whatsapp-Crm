import { Module } from '@nestjs/common';
import { ContactsModule } from '../contacts/contacts.module';
import { InboxModule } from '../inbox/inbox.module';
import { TemplatesModule } from '../templates/templates.module';
import { AutomationsController } from './automations.controller';
import { AutomationsListenerService } from './automations-listener.service';
import { AutomationsService } from './automations.service';

@Module({
  imports: [ContactsModule, InboxModule, TemplatesModule],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationsListenerService],
})
export class AutomationsModule {}
