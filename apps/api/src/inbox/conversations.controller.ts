import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { PERMISSIONS } from '../common/permissions';
import { ConversationsService } from './conversations.service';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { QueryConversationsDto } from './dto/query-conversations.dto';
import { SendMessageDto } from './dto/send-message.dto';

// Inbox conversations ARE WhatsApp messaging — reuses the same 'whatsapp'
// module key as WhatsAppController rather than a separate one, so
// disabling WhatsApp for an org blocks the whole send pipeline in one
// place, not just account management.
@Controller('conversations')
@RequirePermissions(PERMISSIONS.MESSAGES_MANAGE)
@RequireModule('whatsapp')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(@Query() query: QueryConversationsDto) {
    return this.conversationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string, @Query() query: QueryConversationsDto) {
    return this.conversationsService.messages(id, query);
  }

  @Post()
  create(
    @Body() dto: CreateConversationDto,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.conversationsService.createConversation(
      dto.contactId,
      dto.whatsAppAccountId,
      organizationId,
    );
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.conversationsService.sendMessage(id, dto, user.id);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.conversationsService.markRead(id);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignConversationDto) {
    return this.conversationsService.assign(id, dto);
  }
}
