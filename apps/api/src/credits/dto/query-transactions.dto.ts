import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class QueryTransactionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['CREDIT', 'DEBIT'])
  type?: 'CREDIT' | 'DEBIT';
}
