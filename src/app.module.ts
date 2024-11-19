import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module'; 
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule], 
})
export class AppModule {}
