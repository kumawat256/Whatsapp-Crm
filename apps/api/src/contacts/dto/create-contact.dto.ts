import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import {
  normalizePhoneNumber,
  PHONE_NUMBER_PATTERN,
} from '../phone-number.util';

export class CreateContactDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  // Runs before @Matches below — a number typed without a country code
  // (this deployment is India-only) is normalized to +91... automatically
  // instead of being rejected.
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizePhoneNumber(value) : value,
  )
  @Matches(PHONE_NUMBER_PATTERN, {
    message:
      'phoneNumber must be a valid number, e.g. +916377720778 (a country code is added automatically for 10-digit Indian numbers)',
  })
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
