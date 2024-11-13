import { Injectable } from '@nestjs/common';
import { CrudService } from '../../crud.service';
import { Prisma, PrismaClient, Usuario } from '@prisma/client';

@Injectable()
export class UserService extends CrudService<Usuario> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'usuario');
  }


  async findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.prisma.usuario.create({
      data,
    });
  }
}
