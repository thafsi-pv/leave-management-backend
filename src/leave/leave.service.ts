import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ShiftType, LeaveStatus } from '@prisma/client';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto, user: any) {
    const { shift, date, reason } = createLeaveDto;
    const leaveDate = new Date(date);

    // Check if user already has a leave for this date and shift
    const existingLeave = await this.prisma.leave.findFirst({
      where: {
        userId: user.id,
        date: leaveDate,
        shift: shift as ShiftType,
      },
    });

    if (existingLeave) {
      throw new BadRequestException('You already have a leave request for this date and shift');
    }

    // Check availability for the shift
    const availability = await this.getShiftAvailability(shift as ShiftType, leaveDate);
    if (availability.available <= 0) {
      throw new BadRequestException('No available slots for this shift on this date');
    }

    return this.prisma.leave.create({
      data: {
        userId: user.id,
        shift: shift as ShiftType,
        date: leaveDate,
        reason,
      },
    });
  }

  async findAll(user: any, isAdmin: boolean = false) {
    if (isAdmin) {
      return this.prisma.leave.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.leave.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, user: any, isAdmin: boolean = false) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!leave) {
      throw new BadRequestException('Leave request not found');
    }

    if (!isAdmin && leave.userId !== user.id) {
      throw new ForbiddenException('You can only view your own leave requests');
    }

    return leave;
  }

  async update(id: number, updateLeaveDto: UpdateLeaveDto, user: any, isAdmin: boolean = false) {
    const leave = await this.findOne(id, user, isAdmin);

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update leave requests');
    }

    return this.prisma.leave.update({
      where: { id },
      data: updateLeaveDto,
    });
  }

  async remove(id: number, user: any, isAdmin: boolean = false) {
    const leave = await this.findOne(id, user, isAdmin);

    if (!isAdmin && leave.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own leave requests');
    }

    await this.prisma.leave.delete({ where: { id } });
    return { message: 'Leave request deleted successfully' };
  }

  async getShiftAvailability(shift: ShiftType, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const approvedCount = await this.prisma.leave.count({
      where: {
        shift,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: LeaveStatus.APPROVED,
      },
    });

    const pendingCount = await this.prisma.leave.count({
      where: {
        shift,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: LeaveStatus.PENDING,
      },
    });

    const maxSlots = this.getMaxSlotsForShift(shift);
    const totalUsed = approvedCount + pendingCount;
    
    return {
      shift,
      date,
      used: approvedCount,
      pending: pendingCount,
      available: Math.max(0, maxSlots - totalUsed),
      maxSlots,
    };
  }

  async getCalendarData(year: number, month: number) {
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

    const calendarData = {};
    
    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      calendarData[dateKey] = {
        shift1: { used: 0, available: 5, pending: 0 },
        shift2: { used: 0, available: 5, pending: 0 },
        night: { used: 0, available: 10, pending: 0 },
      };

      const dayLeaves = leaves.filter(leave => 
        leave.date.toISOString().split('T')[0] === dateKey
      );

      dayLeaves.forEach(leave => {
        const shiftKey = leave.shift.toLowerCase();
        if (leave.status === LeaveStatus.APPROVED) {
          calendarData[dateKey][shiftKey].used++;
          calendarData[dateKey][shiftKey].available--;
        } else if (leave.status === LeaveStatus.PENDING) {
          calendarData[dateKey][shiftKey].pending++;
          calendarData[dateKey][shiftKey].available--;
        }
      });
    }

    return calendarData;
  }

  private getMaxSlotsForShift(shift: ShiftType): number {
    switch (shift) {
      case ShiftType.SHIFT1:
      case ShiftType.SHIFT2:
        return 5;
      case ShiftType.NIGHT:
        return 10;
      default:
        return 0;
    }
  }
}
