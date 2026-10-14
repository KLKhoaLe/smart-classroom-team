import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../../entities/device.entity';
import { DeviceEvent } from '../../entities/device-event.entity';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
@Module({ imports: [TypeOrmModule.forFeature([Device, DeviceEvent])], controllers: [DevicesController], providers: [DevicesService] })
export class DevicesModule {}
