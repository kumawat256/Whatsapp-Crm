import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MODULE_KEY = 'requireModule';

// Gates a route behind Organization.enabledModules[moduleKey] (checked by
// TenantStatusGuard). A module missing from the map — including every
// organization before this feature is ever touched — is treated as
// enabled, so this is purely opt-in for customers Super Admin has
// explicitly toggled off.
export const RequireModule = (moduleKey: string) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleKey);
