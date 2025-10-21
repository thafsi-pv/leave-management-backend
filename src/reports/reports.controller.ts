import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  getDailyReport(@Query('date') date: string, @Request() req) {
    return this.reportsService.getDailyReport(date, req.user);
  }

  @Get('weekly')
  getWeeklyReport(@Query('startDate') startDate: string, @Request() req) {
    return this.reportsService.getWeeklyReport(startDate, req.user);
  }

  @Get('monthly')
  getMonthlyReport(@Query('year') year: number, @Query('month') month: number, @Request() req) {
    return this.reportsService.getMonthlyReport(year, month, req.user);
  }
}

