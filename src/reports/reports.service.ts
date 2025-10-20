import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailyReport(date: string, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access reports');
    }

    const reportDate = new Date(date);
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    const leaves = await this.prisma.leave.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { user: true },
    });

    const summary = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'APPROVED').length,
      pending: leaves.filter(l => l.status === 'PENDING').length,
      rejected: leaves.filter(l => l.status === 'REJECTED').length,
      byShift: {
        shift1: leaves.filter(l => l.shift === 'SHIFT1').length,
        shift2: leaves.filter(l => l.shift === 'SHIFT2').length,
        night: leaves.filter(l => l.shift === 'NIGHT').length,
      },
    };

    return {
      date: reportDate.toISOString().split('T')[0],
      summary,
      details: leaves,
    };
  }

  async getWeeklyReport(startDate: string, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access reports');
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const leaves = await this.prisma.leave.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: { user: true },
    });

    const dailySummary = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      const dayLeaves = leaves.filter(l => 
        l.date.toISOString().split('T')[0] === dateKey
      );

      dailySummary[dateKey] = {
        total: dayLeaves.length,
        approved: dayLeaves.filter(l => l.status === 'APPROVED').length,
        pending: dayLeaves.filter(l => l.status === 'PENDING').length,
        rejected: dayLeaves.filter(l => l.status === 'REJECTED').length,
        byShift: {
          shift1: dayLeaves.filter(l => l.shift === 'SHIFT1').length,
          shift2: dayLeaves.filter(l => l.shift === 'SHIFT2').length,
          night: dayLeaves.filter(l => l.shift === 'NIGHT').length,
        },
      };
    }

    const totalSummary = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'APPROVED').length,
      pending: leaves.filter(l => l.status === 'PENDING').length,
      rejected: leaves.filter(l => l.status === 'REJECTED').length,
    };

    return {
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
      totalSummary,
      dailySummary,
      details: leaves,
    };
  }

  async getMonthlyReport(year: number, month: number, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access reports');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const leaves = await this.prisma.leave.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { user: true },
    });

    const weeklySummary = {};
    const weeks = Math.ceil(endDate.getDate() / 7);
    
    for (let week = 0; week < weeks; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekLeaves = leaves.filter(l => 
        l.date >= weekStart && l.date <= weekEnd
      );

      weeklySummary[`week_${week + 1}`] = {
        total: weekLeaves.length,
        approved: weekLeaves.filter(l => l.status === 'APPROVED').length,
        pending: weekLeaves.filter(l => l.status === 'PENDING').length,
        rejected: weekLeaves.filter(l => l.status === 'REJECTED').length,
      };
    }

    const totalSummary = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'APPROVED').length,
      pending: leaves.filter(l => l.status === 'PENDING').length,
      rejected: leaves.filter(l => l.status === 'REJECTED').length,
      byShift: {
        shift1: leaves.filter(l => l.shift === 'SHIFT1').length,
        shift2: leaves.filter(l => l.shift === 'SHIFT2').length,
        night: leaves.filter(l => l.shift === 'NIGHT').length,
      },
    };

    return {
      period: { year, month, start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
      totalSummary,
      weeklySummary,
      details: leaves,
    };
  }
}
