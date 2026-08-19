import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@Controller('admin/dashboard')
@Roles('Super Admin')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('overview')
  overview(@Query() query: QueryDashboardDto) {
    return this.dashboardService.getOverview(query);
  }

  @Get('usage')
  usage(@Query() query: QueryDashboardDto) {
    return this.dashboardService.getUsage(query);
  }

  @Get('trend')
  trend() {
    return this.dashboardService.getTrend();
  }
}
