import { IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class QueryMessageUsageReportDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
