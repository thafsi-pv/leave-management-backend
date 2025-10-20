import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig(key: string) {
    const config = await this.prisma.config.findUnique({ where: { key } });
    return config ? config.value : null;
  }

  async setConfig(key: string, value: any, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can modify configuration');
    }

    return this.prisma.config.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getShiftConfig() {
    const shift1Limit = await this.getConfig('shift1_limit') || 5;
    const shift2Limit = await this.getConfig('shift2_limit') || 5;
    const nightLimit = await this.getConfig('night_limit') || 10;
    const activeDays = await this.getConfig('active_days') || [1, 2, 3, 4, 5]; // Monday to Friday

    return {
      shift1Limit,
      shift2Limit,
      nightLimit,
      activeDays,
    };
  }

  async setShiftConfig(config: any, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can modify configuration');
    }

    const { shift1Limit, shift2Limit, nightLimit, activeDays } = config;

    await Promise.all([
      this.setConfig('shift1_limit', shift1Limit, user),
      this.setConfig('shift2_limit', shift2Limit, user),
      this.setConfig('night_limit', nightLimit, user),
      this.setConfig('active_days', activeDays, user),
    ]);

    return this.getShiftConfig();
  }
}
