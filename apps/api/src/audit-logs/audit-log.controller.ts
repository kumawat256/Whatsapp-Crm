import { Controller, Get, Query } from '@nestjs/common';
import { PERMISSIONS } from '../common/permissions';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Controller('audit-logs')
@RequirePermissions(PERMISSIONS.AUDIT_LOGS_VIEW)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogService.findAll(query);
  }
}
