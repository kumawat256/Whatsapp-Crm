import { IsString, MinLength } from 'class-validator';

export class RelaunchCampaignDto {
  @IsString()
  @MinLength(1)
  name!: string;
}
