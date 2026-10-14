import { IsIn, IsOptional, IsString } from 'class-validator';
export class CreateDecisionDto {
  @IsString() room: string;
  @IsOptional() @IsString() telemetry_id?: string;
  @IsIn(['RULE','AI']) decision_source: string;
  @IsIn(['ON','OFF','KEEP']) fan_action: string;
  @IsIn(['ON','OFF','KEEP']) light_action: string;
  @IsOptional() @IsString() mode?: string;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() model_name?: string;
}
