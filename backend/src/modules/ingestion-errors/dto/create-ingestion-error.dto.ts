import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateIngestionErrorDto {
  @IsOptional() @IsString() device_id?: string;
  @IsOptional() @IsString() room?: string;
  @IsOptional() @IsNumber() temperature?: number;
  @IsOptional() @IsNumber() humidity?: number;
  @IsOptional() @IsBoolean() occupancy?: boolean;
  @IsOptional() @IsNumber() light_raw?: number;
  @IsString() error_reason: string;
  @IsOptional() @IsDateString() timestamp?: string;
}
