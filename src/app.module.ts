import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthGuard } from './guards/auth.guard';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [UserModule, CustomersModule],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
