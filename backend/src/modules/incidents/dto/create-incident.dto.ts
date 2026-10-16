import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateIncidentDto {
  @IsString() @IsNotEmpty() room: string;
  @IsOptional() @IsString() device_id?: string;
  @IsOptional() @IsString() telemetry_id?: string;
  @IsString() @IsNotEmpty() incident_type: string;
  @IsIn(['INFO','LOW','WARNING','MEDIUM','HIGH','CRITICAL']) severity: string;
  @IsString() @IsNotEmpty() @MinLength(3) message: string;
}
