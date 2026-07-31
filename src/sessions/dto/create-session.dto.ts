import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { SessionStatus } from '../entities/session.entity';

export class CreateSessionDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsUUID()
  counsellorId!: string;

  @IsDateString()
  scheduledStartTime!: Date;

  @IsDateString()
  scheduledEndTime!: Date;

  @IsOptional()
  @IsDateString()
  actualStartTime?: Date;

  @IsOptional()
  @IsDateString()
  actualEndTime?: Date;

  @IsOptional()
  @IsBoolean()
  requiresBuffer?: boolean;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsInt()
  @Min(1)
  sessionNumber!: number;

  @IsOptional()
  @IsString()
  sessionSummary?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  statusReason?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  Severity?: number;
}
