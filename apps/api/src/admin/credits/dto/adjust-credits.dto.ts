import { IsIn, IsInt, IsString, Min, MinLength } from 'class-validator';

export class AdjustCreditsDto {
  @IsIn(['CREDIT', 'DEBIT'])
  type!: 'CREDIT' | 'DEBIT';

  @IsInt()
  @Min(1)
  amount!: number;

  // Required (unlike the tenant-facing top-up's optional reason) — every
  // manual Super Admin adjustment must be explainable in the ledger.
  @IsString()
  @MinLength(3)
  reason!: string;
}
