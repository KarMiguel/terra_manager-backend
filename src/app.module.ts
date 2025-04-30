import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module'; 
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FazendaModule } from './modules/fazenda/fazenda.module';
import { ProdutoEstoqueModule } from './modules/produtoEstoque/produto-estoque.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule,
    DashboardModule,
    FazendaModule,
    ProdutoEstoqueModule,
    FornecedorModule
  ],
})
export class AppModule {}
