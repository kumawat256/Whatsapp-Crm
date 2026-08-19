import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactsCsvService } from './csv/contacts-csv.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, ContactsCsvService],
  exports: [ContactsService],
})
export class ContactsModule {}
