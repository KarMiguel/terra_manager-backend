import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário para autenticação.',
    example: 'carlosmiguel.dsa12@gmail.com',
  })
  @IsNotEmpty({ message: 'O campo "email" é obrigatório.' })
  @IsEmail({}, { message: 'O campo "email" deve ser um e-mail válido.' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário.',
    example: 'senha123',
  })
  @IsNotEmpty({ message: 'O campo "password" é obrigatório.' })
  @IsString({ message: 'O campo "password" deve ser uma string.' })
  password: string;
}
