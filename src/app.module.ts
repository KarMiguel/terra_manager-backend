import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module'; 
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FazendaModule } from './modules/fazenda/fazenda.module';
import { ProdutoEstoqueModule } from './modules/produtoEstoque/produto-estoque.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { CultivarModule } from './modules/cultivar/cultivar.module';
import { PragaModule } from './modules/praga/praga.module';
import { PlantioModule } from './modules/plantio/plantio.module';
import { AnaliseSoloModule } from './modules/analiseSolo/analise-solo.module';
import { LogModule } from './modules/log/log.module';
import { LoggingInterceptorModule } from './common/interceptors/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    LoggingInterceptorModule,
    AuthModule,
    UserModule,
    DashboardModule,
    FazendaModule,
    ProdutoEstoqueModule,
    FornecedorModule,
    PragaModule,
    CultivarModule,
    PlantioModule,
    AnaliseSoloModule,
    LogModule
  ],
})
export class AppModule {}
