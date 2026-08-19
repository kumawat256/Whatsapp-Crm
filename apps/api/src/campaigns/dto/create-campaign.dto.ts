import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  templateId!: string;

  @IsString()
  whatsAppAccountId!: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
