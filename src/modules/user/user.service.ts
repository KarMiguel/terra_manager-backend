import { Injectable } from '@nestjs/common';
import { CrudService } from '../../crud.service';
import { Prisma, PrismaClient, Usuario } from '@prisma/client';
import { BasicUser } from './interface/user.interface';

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
  
  async findAllPaginated(
    page: number,
    size: number,
  ): Promise<{ data: BasicUser[]; total: number }> {
    const total = await this.prisma.usuario.count();

    const data = await this.prisma.usuario.findMany({
      skip: page, 
      take: size, 
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return { data, total };
  }

}
