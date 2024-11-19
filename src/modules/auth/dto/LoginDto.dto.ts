import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'O campo "email" é obrigatório.' })
  @IsEmail({}, { message: 'O campo "email" deve ser um e-mail válido.' })
  email: string;

  @IsNotEmpty({ message: 'O campo "password" é obrigatório.' })
  @IsString({ message: 'O campo "password" deve ser uma string.' })
  password: string;
}
