import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetOrganizationUserPasswordDto {
  @IsString()
  userId!: string;

  // If omitted, a random password is generated and returned once.
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
