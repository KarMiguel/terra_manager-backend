import { Injectable } from '@nestjs/common';
import { CrudService } from '../../crud.service';
import { Prisma, PrismaClient, Usuario } from '@prisma/client';
import { UserModel } from './interface/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService extends CrudService<Usuario, UserModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'usuario', UserModel);
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
  
  async updateUser(userId: number, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { id: userId },
      data,
    });
  }

  // async findAllPaginated(
  //   skip: number,
  //   size: number,
  //   options: Record<string, any> = {},
  // ): Promise<{ data: BasicUser[]; total: number }> {

  //   const total = await this.prisma.usuario.count({
  //     where: options.where, // Usa `where` do `options`, se fornecido
  //   });

  //   const validOptions = this.filterPrismaOptions(options);

  //   const entities = await this.prisma.usuario.findMany({
  //     skip,
  //     take: size,
  //     ...validOptions,
  //   });

  //   const data = plainToInstance(BasicUser, entities, {
  //     excludeExtraneousValues: true, 
  //   });

  //   return { data, total };
  // }

  private filterPrismaOptions(options: Record<string, any>): Record<string, any> {
    const validKeys = ['where', 'orderBy', 'include', 'select', 'distinct', 'cursor'];
    return Object.keys(options).reduce((filtered, key) => {
      if (validKeys.includes(key)) {
        filtered[key] = options[key];
      }
      return filtered;
    }, {} as Record<string, any>);
  }

  async findByResetPasswordToken(token: string): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
  }
}
