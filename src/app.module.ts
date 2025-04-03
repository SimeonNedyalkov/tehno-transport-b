import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthGuard } from './guards/auth.guard';
import { CustomersModule } from './customers/customers.module';
import { MessageModule } from './message/message.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    UserModule,
    CustomersModule,
    MessageModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
