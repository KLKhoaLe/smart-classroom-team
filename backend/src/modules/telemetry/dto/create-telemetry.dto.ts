import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTelemetryDto {
  @IsString() device_id: string;
  @IsString() room: string;
  @Type(() => Number) @IsNumber() @Min(-40) @Max(80) temperature: number;
  @Type(() => Number) @IsNumber() @Min(0) @Max(100) humidity: number;
  @IsBoolean() occupancy: boolean;
  @Type(() => Number) @IsNumber() @Min(0) @Max(4095) light_raw: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) light_percent?: number;
  @IsOptional() @IsDateString() timestamp?: string;
}
