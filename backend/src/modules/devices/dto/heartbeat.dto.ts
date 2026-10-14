import { IsObject, IsOptional, IsString } from 'class-validator';
export class HeartbeatDto {
  @IsString() device_id: string;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
}
