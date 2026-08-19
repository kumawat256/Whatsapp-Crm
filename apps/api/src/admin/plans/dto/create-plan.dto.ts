import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsInt()
  @Min(0)
  credits!: number;

  @IsInt()
  @Min(1)
  maxWhatsAppAccounts!: number;

  /** Days until an assigned org's plan expires and WhatsApp sending is blocked. Omit/null for an evergreen plan that never expires. */
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;
}
