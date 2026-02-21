import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { TalhaoModule } from './modules/talhao/talhao.module';
import { ZonaManejoModule } from './modules/zona-manejo/zona-manejo.module';
import { OperacaoPlantioModule } from './modules/operacao-plantio/operacao-plantio.module';
import { AplicacaoModule } from './modules/aplicacao/aplicacao.module';
import { AnaliseSoloModule } from './modules/analiseSolo/analise-solo.module';
import { LogModule } from './modules/log/log.module';
import { PlanoModule } from './modules/plano/plano.module';
import { MapaModule } from './modules/mapa/mapa.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PlanoModule,
    DashboardModule,
    FazendaModule,
    ProdutoEstoqueModule,
    FornecedorModule,
    PragaModule,
    CultivarModule,
    PlantioModule,
    TalhaoModule,
    ZonaManejoModule,
    MapaModule,
    OperacaoPlantioModule,
    AplicacaoModule,
    AnaliseSoloModule,
    LogModule,
  ],
})
export class AppModuleServerless {}
