import { IsInt, Max, Min } from 'class-validator';

export class UpdateCampaignSettingsDto {
  @IsInt()
  @Min(1)
  @Max(50)
  batchSize!: number;

  @IsInt()
  @Min(1)
  @Max(3600)
  intervalMinSeconds!: number;

  @IsInt()
  @Min(1)
  @Max(3600)
  intervalMaxSeconds!: number;
}
