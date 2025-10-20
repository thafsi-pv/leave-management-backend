import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class UpdateLeaveDto {
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;
}
