import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsString()
  mediaId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
