import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';

export class QueryDashboardDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['today', 'yesterday', '7d', '30d', 'custom'])
  range?: 'today' | 'yesterday' | '7d' | '30d' | 'custom';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
