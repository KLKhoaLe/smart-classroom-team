import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTelemetryDto {
  @IsString() device_id: string;
  @IsString() room: string;
  @IsNumber() @Min(-40) @Max(80) temperature: number;
  @IsNumber() @Min(0) @Max(100) humidity: number;
  @IsBoolean() occupancy: boolean;
  @IsNumber() @Min(0) @Max(4095) light_raw: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) light_percent?: number;
  @IsOptional() @IsDateString() timestamp?: string;
}
