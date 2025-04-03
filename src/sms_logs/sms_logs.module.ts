import { Module } from '@nestjs/common';
import { SmsLogsService } from './sms_logs.service';
import { SmsLogsController } from './sms_logs.controller';

@Module({
  controllers: [SmsLogsController],
  providers: [SmsLogsService],
})
export class SmsLogsModule {}
