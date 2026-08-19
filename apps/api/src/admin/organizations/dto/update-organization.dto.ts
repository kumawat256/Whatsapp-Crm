import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  // Explicit null clears the plan; omitted leaves it unchanged.
  @IsOptional()
  @IsString()
  planId?: string | null;
}
