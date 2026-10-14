import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
export class CreateCommandDto {
  @IsString() device_id: string;
  @IsIn(['FAN','LIGHT','BUZZER']) command_type: string;
  @IsIn(['ON','OFF']) action: string;
  @IsOptional() @IsIn(['AUTO','MANUAL','SAFETY']) source?: string;
  @IsOptional() @IsString() decision_id?: string;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
}
