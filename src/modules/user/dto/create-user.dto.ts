import { IsEnum, IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/guards/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Senha do usuário.',
    example: 'senha123',
  })
  @IsNotEmpty({ message: 'O campo "password" é obrigatório.' })
  @IsString({ message: 'O campo "password" deve ser uma string.' })
  password: string;

  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'João da Silva',
  })
  @IsNotEmpty({ message: 'O campo "name" é obrigatório.' })
  @IsString({ message: 'O campo "name" deve ser uma string.' })
  name: string;

  @ApiProperty({
    description: 'Email do usuário.',
    example: 'joao.silva@email.com',
  })
  @IsNotEmpty({ message: 'O campo "email" é obrigatório.' })
  @IsEmail({}, { message: 'O campo "email" deve conter um e-mail válido.' })
  email: string;

  @ApiPropertyOptional({
    description: 'Papel do usuário no sistema.',
    example: Role.USER,
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role, { message: `O campo "role" deve ser um dos seguintes valores: ${Object.values(Role).join(', ')}.` })
  role?: Role;

  @ApiPropertyOptional({
    description: 'CPF do usuário.',
    example: '12345678900',
  })
  @IsOptional()
  @IsString({ message: 'O campo "cpf" deve ser uma string.' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário.',
    example: '11987654321',
  })
  @IsOptional()
  @IsString({ message: 'O campo "telefone" deve ser uma string.' })
  telefone?: string;
}
