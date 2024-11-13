import { IsString, IsOptional, IsBoolean, IsEmail, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  idPlano?: number;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
