import { Type } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class QueryContactsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @Type(() => String)
  @IsBooleanString()
  isOptedOut?: string;
}
