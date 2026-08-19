import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class QueryConversationsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  assignedToUserId?: string;

  @IsOptional()
  @IsString()
  whatsAppAccountId?: string;
}
