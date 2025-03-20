import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthGuard } from './guards/auth.guard';
import { CustomersModule } from './customers/customers.module';
import { DueSoonCustomersModule } from './due-soon-customers/due-soon-customers.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [UserModule, CustomersModule, DueSoonCustomersModule, MessageModule],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
