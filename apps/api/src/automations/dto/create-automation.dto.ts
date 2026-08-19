import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const TRIGGER_TYPES = ['message_received'] as const;
export const ACTION_TYPES = ['send_template'] as const;

export class CreateAutomationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(TRIGGER_TYPES)
  triggerType!: (typeof TRIGGER_TYPES)[number];

  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, unknown>;

  @IsIn(ACTION_TYPES)
  actionType!: (typeof ACTION_TYPES)[number];

  @IsObject()
  actionConfig!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
