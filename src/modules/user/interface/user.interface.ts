import { Expose } from 'class-transformer';

export class BasicUser {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: string;

  @Expose()
  cpf!: string;

  @Expose()
  telefone!: string;
}
