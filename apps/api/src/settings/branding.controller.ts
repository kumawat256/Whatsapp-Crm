import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SettingsService } from './settings.service';

const DEFAULT_APP_NAME = 'WhatsApp CRM';

// Deliberately a separate controller from SettingsController, not just an
// extra route on it — SettingsController is class-level gated behind
// settings.manage (Super Admin only), but branding needs to be readable by
// literally everyone, including the login page before any user is
// authenticated at all.
@Controller('branding')
export class BrandingController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async get() {
    const [appName, supportContact] = await Promise.all([
      this.settingsService.findOne('branding.appName'),
      this.settingsService.findOne('branding.supportContact'),
    ]);
    return {
      appName:
        typeof appName?.value === 'string' && appName.value
          ? appName.value
          : DEFAULT_APP_NAME,
      supportContact:
        typeof supportContact?.value === 'string' && supportContact.value
          ? supportContact.value
          : null,
    };
  }
}
