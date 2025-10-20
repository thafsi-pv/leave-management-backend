import { IsEnum, IsString, IsDateString } from 'class-validator';
import { ShiftType } from '@prisma/client';

export class CreateLeaveDto {
  @IsEnum(ShiftType)
  shift: ShiftType;

  @IsDateString()
  date: string;

  @IsString()
  reason: string;
}
