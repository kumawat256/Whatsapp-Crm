import { IsString, MinLength } from 'class-validator';

export class CreateWhatsAppAccountDto {
  @IsString()
  @MinLength(1)
  label!: string;
}
