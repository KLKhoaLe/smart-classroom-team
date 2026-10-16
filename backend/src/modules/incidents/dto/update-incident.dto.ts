import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateIncidentDto {
  @IsOptional() @IsIn(['OPEN', 'RESOLVED']) status?: string;
  @IsOptional() @IsIn(['INFO', 'LOW', 'WARNING', 'MEDIUM', 'HIGH', 'CRITICAL']) severity?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MinLength(3) message?: string;
}