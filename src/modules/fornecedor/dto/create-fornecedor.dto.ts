import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  Length,
  IsPhoneNumber,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFornecedorDto {
  @ApiProperty({
    description: 'CNPJ do fornecedor (exatamente 14 caracteres)',
    example: '12345678000199',
  })
  @IsString()
  @Length(14, 14, { message: 'O CNPJ deve conter exatamente 14 caracteres' })
  cnpj: string;

  @ApiProperty({
    description: 'Razão social do fornecedor',
    example: 'Fornecedor LTDA',
  })
  @IsString()
  razaoSocial: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia do fornecedor',
    example: 'Fornecedor Rápido',
  })
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiPropertyOptional({
    description: 'Nome do responsável pelo fornecedor',
    example: 'Carlos Pereira',
  })
  @IsOptional()
  @IsString()
  responsavel?: string;

  @ApiProperty({
    description: 'Email de contato do fornecedor',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'Telefone de contato do fornecedor',
    example: '+5511999999999',
  })
  @IsPhoneNumber()
  @IsOptional()
  telefone: string;

  @ApiPropertyOptional({
    description: 'Link para o site institucional do fornecedor',
    example: 'https://www.fornecedor.com.br',
  })
  @IsOptional()
  @IsString()
  linkSite?: string;

  @ApiPropertyOptional({
    description: 'Indica se o fornecedor está ativo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiProperty({
    description: 'Logradouro do endereço do fornecedor',
    example: 'Rua das Flores, 123',
  })
  @IsString()
  @IsOptional()
  logradouro?: string;

  @ApiPropertyOptional({
    description: 'Número do endereço',
    example: '123',
  })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Sala 4',
  })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiPropertyOptional({
    description: 'Bairro do fornecedor',
    example: 'Centro',
  })
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiProperty({
    description: 'Cidade do fornecedor',
    example: 'São Paulo',
  })
  @IsString()
  @IsOptional()
  cidade: string;

  @ApiProperty({
    description: 'Estado do fornecedor',
    example: 'SP',
  })
  @IsString()
  @IsOptional()
  estado: string;

  @ApiProperty({
    description: 'CEP do endereço do fornecedor',
    example: '01234-567',
  })
  @IsString()
  @IsOptional()
  cep: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais sobre o fornecedor',
    example: 'Fornecedor especializado em sementes de soja',
  })
  @IsString()
  @IsOptional()
  observacao?: string;
}
