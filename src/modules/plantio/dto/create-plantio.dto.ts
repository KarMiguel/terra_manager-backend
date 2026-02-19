import {
    IsInt,
    IsString,
    IsEnum,
    IsNumber,
    IsDateString,
    IsOptional,
    IsBoolean,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { UnidadeDoseEnum, StatusPlantioEnum } from '../enum/plantio.enum';
  
  export class CreatePlantioDto {
    @ApiProperty({ description: 'ID da cultivar associada', example: 1 })
    @IsInt()
    idCultivar: number;
  
    @ApiProperty({ description: 'ID da fazenda onde o plantio ocorreu', example: 1 })
    @IsInt()
    idFazenda: number;

    @ApiPropertyOptional({ description: 'ID do talhão (parcela da fazenda)', example: 1 })
    @IsOptional()
    @IsInt()
    idTalhao?: number;

    @ApiPropertyOptional({ description: 'ID da analise solo associada', example: 1 })
    @IsInt()
    @IsOptional()
    idAnaliseSolo?: number;
  
    @ApiProperty({ description: 'Data em que o plantio foi realizado', example: '2025-05-06T10:00:00.000Z' })
    @IsDateString()
    dataPlantio: string;
  
    @ApiPropertyOptional({ description: 'Data em que as plantas emergiram', example: '2025-05-12T08:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    dataEmergencia?: string;
  
    @ApiPropertyOptional({ description: 'Previsão de data para colheita', example: '2025-10-01T00:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    dataPrevistaColheita?: string;
  
    @ApiPropertyOptional({ description: 'Data em que a planta atingiu maturação', example: '2025-09-25T00:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    dataMaturacao?: string;
  
    @ApiProperty({ description: 'Área plantada em hectares', example: 10.5 })
    @IsNumber()
    areaPlantada: number;
  
    @ApiProperty({ description: 'Densidade planejada (plantas/ha)', example: 300000 })
    @IsNumber()
    densidadePlanejada: number;

    @ApiProperty({ description: 'Densidade plantio real (plantas/ha)', example: 300000 })
    @IsNumber()
    densidadePlantioReal: number;
  
    @ApiPropertyOptional({ description: 'pH do solo no momento do plantio', example: 6.5 })
    @IsNumber()
    @IsOptional()
    phSoloInicial?: number;
  
    @ApiPropertyOptional({ description: 'Umidade do solo antes do plantio (%)', example: 20 })
    @IsNumber()
    @IsOptional()
    umidadeSoloInicial?: number;
  
    @ApiPropertyOptional({ description: 'Código do lote de sementes', example: 'LTP-202505' })
    @IsString()
    @IsOptional()
    loteSemente?: string;
  
    @ApiPropertyOptional({ description: 'Taxa de germinação informada pelo fornecedor (%)', example: 95 })
    @IsNumber()
    @IsOptional()
    taxaGerminacao?: number;
  
    @ApiPropertyOptional({ description: 'Tratamento aplicado à semente', example: 'Inoculante' })
    @IsString()
    @IsOptional()
    tratamentoSemente?: string;
  
    @ApiPropertyOptional({ description: 'Profundidade de semeadura em cm', example: 5 })
    @IsNumber()
    @IsOptional()
    profundidadeSemeadura?: number;
  
    @ApiPropertyOptional({ description: 'Espaçamento entre linhas em cm', example: 45 })
    @IsNumber()
    @IsOptional()
    espacamentoEntreLinhas?: number;
  
    @ApiPropertyOptional({ description: 'Orientação do transplante (ex: N-S, L-O)', example: 'N-S' })
    @IsString()
    @IsOptional()
    orientacaoTransplantio?: string;
  
    @ApiProperty({ description: 'Lâmina de água aplicada no plantio (mm)', example: 50 })
    @IsNumber()
    mmAguaAplicado: number;
  
    @ApiPropertyOptional({ description: 'Volume de irrigação aplicado (mm)', example: 30 })
    @IsNumber()
    @IsOptional()
    irrigacaoVolume?: number;
  
    @ApiPropertyOptional({ description: 'Duração da irrigação em minutos', example: 120 })
    @IsNumber()
    @IsOptional()
    irrigacaoDuracao?: number;
  
    @ApiPropertyOptional({ description: 'Dose de fertilizante de nitrogênio', example: 50 })
    @IsNumber()
    @IsOptional()
    aduboNitrogenioDose?: number;
  
    @ApiPropertyOptional({ description: 'Unidade da dose de nitrogênio', enum: UnidadeDoseEnum, example: UnidadeDoseEnum.KG_HA })
    @IsEnum(UnidadeDoseEnum)
    @IsOptional()
    aduboNitrogenioUnidade?: UnidadeDoseEnum;
  
    @ApiPropertyOptional({ description: 'Dose de fertilizante de fósforo', example: 30 })
    @IsNumber()
    @IsOptional()
    aduboFosforoDose?: number;
  
    @ApiPropertyOptional({ description: 'Unidade da dose de fósforo', enum: UnidadeDoseEnum, example: UnidadeDoseEnum.KG_HA })
    @IsEnum(UnidadeDoseEnum)
    @IsOptional()
    aduboFosforoUnidade?: UnidadeDoseEnum;
  
    @ApiPropertyOptional({ description: 'Dose de fertilizante de potássio', example: 40 })
    @IsNumber()
    @IsOptional()
    aduboPotassioDose?: number;
  
    @ApiPropertyOptional({ description: 'Unidade da dose de potássio', enum: UnidadeDoseEnum, example: UnidadeDoseEnum.KG_HA })
    @IsEnum(UnidadeDoseEnum)
    @IsOptional()
    aduboPotassioUnidade?: UnidadeDoseEnum;
  
    @ApiPropertyOptional({ description: 'Defensivo utilizado no plantio', example: 'Fungicida XPTO' })
    @IsString()
    @IsOptional()
    defensivoUtilizado?: string;
  
    @ApiPropertyOptional({ description: 'Dose de defensivo aplicada', example: 200 })
    @IsNumber()
    @IsOptional()
    doseDefensivo?: number;
  
    @ApiPropertyOptional({ description: 'Unidade da dose de defensivo', enum: UnidadeDoseEnum, example: UnidadeDoseEnum.ML_HA })
    @IsEnum(UnidadeDoseEnum)
    @IsOptional()
    unidadeDefensivo?: UnidadeDoseEnum;
  
    @ApiPropertyOptional({ description: 'Estimativa de rendimento (kg/ha)', example: 8000 })
    @IsNumber()
    @IsOptional()
    rendimentoEstimado?: number;
  
    @ApiPropertyOptional({ description: 'Custo da semente (R$/ha)', example: 500 })
    @IsNumber()
    @IsOptional()
    custoSemente?: number;
  
    @ApiPropertyOptional({ description: 'Custo do fertilizante (R$/ha)', example: 400 })
    @IsNumber()
    @IsOptional()
    custoFertilizante?: number;
  
    @ApiPropertyOptional({ description: 'Custo do defensivo (R$/ha)', example: 300 })
    @IsNumber()
    @IsOptional()
    custoDefensivo?: number;
  
    @ApiPropertyOptional({ description: 'Custo do combustível (R$)', example: 200 })
    @IsNumber()
    @IsOptional()
    custoCombustivel?: number;
  
    @ApiPropertyOptional({ description: 'Outros custos (R$)', example: 100 })
    @IsNumber()
    @IsOptional()
    custoOutros?: number;
  
    @ApiPropertyOptional({ description: 'Custo total do plantio (R$)', example: 1500 })
    @IsNumber()
    @IsOptional()
    custoTotal?: number;
  
    @ApiPropertyOptional({ description: 'Status do plantio', enum: StatusPlantioEnum, example: StatusPlantioEnum.PLANEJADO })
    @IsEnum(StatusPlantioEnum)
    @IsOptional()
    statusPlantio?: StatusPlantioEnum;
  
    @ApiPropertyOptional({ description: 'Observações gerais sobre o plantio', example: 'Sem problemas na emergência' })
    @IsString()
    @IsOptional()
    observacao?: string;

    @ApiPropertyOptional({ description: 'Indica se o registro está ativo', example: true })
    @IsBoolean()
    @IsOptional()
    ativo?: boolean;
  }
  