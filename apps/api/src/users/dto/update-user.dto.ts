import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
