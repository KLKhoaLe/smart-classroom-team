import { IsBoolean, IsDateString, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateIngestionErrorDto {
  @IsOptional() @IsString() device_id?: string;
  @IsOptional() @IsString() room?: string;
  @IsOptional() @Type(() => Number) @IsNumber() temperature?: number;
  @IsOptional() @Type(() => Number) @IsNumber() humidity?: number;
  @IsOptional() @IsBoolean() occupancy?: boolean;
  @IsOptional() @Type(() => Number) @IsNumber() light_raw?: number;
  @IsString() error_reason: string;
  @IsOptional() @IsDateString() timestamp?: string;
  @IsOptional() @IsObject() raw_payload?: Record<string, unknown>;
}
