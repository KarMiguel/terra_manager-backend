import { IsEnum, IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { Role } from 'src/common/guards/roles.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'O campo "password" é obrigatório.' })
  @IsString({ message: 'O campo "password" deve ser uma string.' })
  password: string;

  @IsNotEmpty({ message: 'O campo "name" é obrigatório.' })
  @IsString({ message: 'O campo "name" deve ser uma string.' })
  name: string;

  @IsNotEmpty({ message: 'O campo "email" é obrigatório.' })
  @IsEmail({}, { message: 'O campo "email" deve conter um e-mail válido.' })
  email: string;

  @IsOptional()
  @IsEnum(Role, { message: `O campo "role" deve ser um dos seguintes valores: ${Object.values(Role).join(', ')}.` })
  role?: Role.USER;

  @IsOptional()
  @IsString({ message: 'O campo "cpf" deve ser uma string.' })
  cpf?: string;

  @IsOptional()
  @IsString({ message: 'O campo "telefone" deve ser uma string.' })
  telefone?: string;
}
