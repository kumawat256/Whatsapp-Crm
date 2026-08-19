import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class QueryAuditLogsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  action?: string;
}
