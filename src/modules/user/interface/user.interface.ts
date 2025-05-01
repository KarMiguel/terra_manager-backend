import { Expose } from 'class-transformer';

export class UserModel {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  nome!: string;

  @Expose()
  role!: string;

  @Expose()
  cpf!: string;

  @Expose()
  telefone!: string;
}
