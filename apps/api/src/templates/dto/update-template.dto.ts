import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  // Widened to allow null so a template's photo can be removed, not just set —
  // CreateTemplateDto's mediaId is create-only and never needs to be cleared.
  @IsOptional()
  @IsString()
  declare mediaId?: string | null;
}
