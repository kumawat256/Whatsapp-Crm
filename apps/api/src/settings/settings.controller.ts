import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { PERMISSIONS } from '../common/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { Audit } from '../audit-logs/decorators/audit.decorator';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  @Audit('setting.update', 'SystemSetting')
  upsert(
    @Param('key') key: string,
    @Body() dto: UpsertSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.settingsService.upsert(key, dto.value, user.id);
  }
}
