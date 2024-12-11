import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module'; 
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FazendaController } from './modules/fazenda/fazenda.controller';
import { FazendaService } from './modules/fazenda/fazenda.service';
import { FazendaModule } from './modules/fazenda/fazenda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule,
    DashboardModule,
    FazendaModule
  ],
})
export class AppModule {}
