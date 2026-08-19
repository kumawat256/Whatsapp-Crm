import { IsOptional, IsString } from 'class-validator';

export class ImpersonateDto {
  // Defaults to the organization's oldest active Admin user when omitted.
  @IsOptional()
  @IsString()
  userId?: string;
}
