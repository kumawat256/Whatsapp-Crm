import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';

export class QueryOrganizationsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status?: 'ACTIVE' | 'SUSPENDED';
}
