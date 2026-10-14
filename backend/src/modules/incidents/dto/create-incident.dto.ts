import { IsIn, IsOptional, IsString } from 'class-validator';
export class CreateIncidentDto {
  @IsString() room: string;
  @IsOptional() @IsString() device_id?: string;
  @IsOptional() @IsString() telemetry_id?: string;
  @IsString() incident_type: string;
  @IsIn(['INFO','WARNING','HIGH','CRITICAL']) severity: string;
  @IsString() message: string;
}
