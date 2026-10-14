import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceCommand } from '../../entities/device-command.entity';
import { Device } from '../../entities/device.entity';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
@Module({ imports: [TypeOrmModule.forFeature([DeviceCommand, Device])], controllers: [CommandsController], providers: [CommandsService] })
export class CommandsModule {}
