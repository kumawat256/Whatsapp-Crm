import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { Audit } from '../audit-logs/decorators/audit.decorator';
import { PERMISSIONS } from '../common/permissions';
import { CreateWhatsAppAccountDto } from './dto/create-account.dto';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp/accounts')
@RequireModule('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  // Intentionally no @RequirePermissions here: any authenticated user needs
  // to see which accounts exist to pick one when sending a message, creating
  // a campaign, etc. Only label/phone/status are exposed — actually
  // connecting, disconnecting, or removing an account stays whatsapp.manage.
  @Get()
  list() {
    return this.whatsAppService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.whatsAppService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.WHATSAPP_MANAGE)
  create(
    @Body() dto: CreateWhatsAppAccountDto,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.whatsAppService.create(dto.label, organizationId);
  }

  @Post(':id/connect')
  @RequirePermissions(PERMISSIONS.WHATSAPP_MANAGE)
  @HttpCode(HttpStatus.OK)
  @Audit('whatsapp.connect', 'WhatsAppAccount')
  connect(@Param('id') id: string) {
    return this.whatsAppService.connect(id);
  }

  @Post(':id/disconnect')
  @RequirePermissions(PERMISSIONS.WHATSAPP_MANAGE)
  @HttpCode(HttpStatus.OK)
  @Audit('whatsapp.disconnect', 'WhatsAppAccount')
  disconnect(@Param('id') id: string) {
    return this.whatsAppService.disconnect(id);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.WHATSAPP_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.whatsAppService.remove(id);
  }
}
