import { Module } from '@nestjs/common';
import { DueSoonCustomersService } from './due-soon-customers.service';
import { DueSoonCustomersController } from './due-soon-customers.controller';

@Module({
  controllers: [DueSoonCustomersController],
  providers: [DueSoonCustomersService],
})
export class DueSoonCustomersModule {}
