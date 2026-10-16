import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

const severityValues = ['INFO', 'LOW', 'WARNING', 'MEDIUM', 'HIGH', 'CRITICAL'];

export class IncidentWorkflowDto {
  @IsOptional() @IsIn(['CREATE', 'RESOLVE', 'UPDATE_STATUS']) action?: string;
  @IsOptional() @IsString() @IsNotEmpty() room?: string;
  @IsOptional() @IsString() device_id?: string;
  @IsOptional() @IsString() telemetry_id?: string;
  @IsOptional() @IsString() @IsNotEmpty() incident_type?: string;
  @IsOptional() @IsIn(severityValues) severity?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MinLength(3) message?: string;
  @IsOptional() @IsString() @IsNotEmpty() incident_id?: string;
  @IsOptional() @IsIn(['OPEN', 'RESOLVED']) status?: string;
}