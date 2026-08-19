import { IsObject } from 'class-validator';

// Deliberately not a strict-key DTO: the module key set is expected to grow
// (see Organization.enabledModules in schema.prisma), so keys are validated
// at runtime in the service instead of enumerated here.
export class UpdateModulesDto {
  @IsObject()
  modules!: Record<string, boolean>;
}
