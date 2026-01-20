import { Module } from '@nestjs/common';
import { DeviceSessionsService } from './device-sessions.service';

@Module({
  providers: [DeviceSessionsService],
  exports: [DeviceSessionsService],
})
export class DevicesModule {}
