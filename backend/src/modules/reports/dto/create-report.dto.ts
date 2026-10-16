import { IsDateString, IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsString() @IsIn(['DAILY', 'WEEKLY', 'WEEKLY_OPTIMIZATION']) report_type: string;
  @IsOptional() @IsString() room?: string;
  @IsDateString() period_start: string;
  @IsDateString() period_end: string;
  @IsOptional() @IsObject() summary?: Record<string, unknown>;
  @IsOptional() @IsString() @MinLength(3) recommendation?: string;
}