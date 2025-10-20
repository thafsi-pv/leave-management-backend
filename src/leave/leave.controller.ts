import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { UserRole } from '@prisma/client';

@Controller('leave')
@UseGuards(AuthGuard('jwt'))
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto, @Request() req) {
    return this.leaveService.create(createLeaveDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.leaveService.findAll(req.user, isAdmin);
  }

  @Get('calendar')
  getCalendarData(@Query('year') year: number, @Query('month') month: number) {
    return this.leaveService.getCalendarData(year, month);
  }

  @Get('availability')
  getAvailability(@Query('shift') shift: string, @Query('date') date: string) {
    return this.leaveService.getShiftAvailability(shift as any, new Date(date));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.leaveService.findOne(+id, req.user, isAdmin);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveDto: UpdateLeaveDto, @Request() req) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.leaveService.update(+id, updateLeaveDto, req.user, isAdmin);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.leaveService.remove(+id, req.user, isAdmin);
  }
}
