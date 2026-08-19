import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  adminFirstName!: string;

  @IsString()
  adminLastName!: string;

  // If omitted, a random password is generated and returned once in the
  // response — same pattern as the initial admin bootstrap in seed.ts.
  @IsOptional()
  @IsString()
  @MinLength(8)
  adminPassword?: string;
}
