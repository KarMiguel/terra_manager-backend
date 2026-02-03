import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { calculatePagination } from "./common/utils/calculatePagination";
import { CrudServiceOptions, Paginate } from "./common/utils/types";
import { plainToInstance } from "class-transformer";
import { PrismaClient, Prisma } from "@prisma/client";

@Injectable()
export abstract class CrudService<T extends object, R extends object = T> {
  constructor(
    protected readonly prisma: PrismaClient,
    private readonly modelName: keyof PrismaClient,
    private readonly responseClass: new () => R,
  ) {}

  private get repository() {
    return this.prisma[this.modelName] as any;
  }

  protected mapToResponse(entity: T): R {
    return plainToInstance(this.responseClass, entity, { excludeExtraneousValues: true });
  }

  protected filterOptions(options: CrudServiceOptions): Record<string, any> {
    const validKeys = [
      'where',
      'include',
      'orderBy',
      'distinct',
      'limit',
      'skip',
      'take',
      'attributes',
    ];
  
    if (options.order) {
      const orderBy = Object.entries(options.order).map(([field, direction]) => {
        if (typeof direction === 'string') {
          const dir = direction.toLowerCase();
          if (dir === 'asc' || dir === 'desc') {
            return { [field]: dir };
          }
        }
        return { [field]: 'asc' };
      });
  
      options.orderBy = orderBy.length === 1 ? orderBy[0] : orderBy;
      delete options.order; 
    }
  
    return Object.keys(options).reduce((filtered, key) => {
      if (validKeys.includes(key)) {
        filtered[key] = options[key];
      }
      return filtered;
    }, {} as Record<string, any>);
  }
  

  // async create(data: DTO): Promise<R> {
  //   try {
  //     const createdEntity = await this.repository.create({ data });
  //     return this.mapToResponse(createdEntity);
  //   } catch (error) {
  //     throw new Error(`Erro ao criar a entidade: ${error.message}`);
  //   }
  // }

  async update(
    id: number, 
    data: any, 
    modifiedBy: string,
  ): Promise<R> {
    try {
      // Verifica se o registro existe
      const existingRecord = await this.prisma[String(this.modelName)].findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new Error(`Registro com ID ${id} não encontrado`);
      }

      // Remove campos que não existem no modelo
      const modelFields = Object.keys(this.prisma[String(this.modelName)].fields);
      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (modelFields.includes(key)) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      // Adiciona campos de auditoria
      const dataToUpdate = {
        ...filteredData,
        modifiedBy,
        dateModified: new Date(), // Usando o campo correto do Prisma
      };

      const updatedEntity = await this.prisma[String(this.modelName)].update({
        where: { id },
        data: dataToUpdate,
      });

      return plainToInstance(this.responseClass, updatedEntity, {
        excludeExtraneousValues: true,
      });
    } catch (error: any) {
      // Captura erros de unique constraint do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target.join(', ') : 'campo único';
        throw new ConflictException(
          `Já existe um registro com o(s) valor(es) informado(s) para ${field}.`
        );
      }
      
      if (error.message.includes('não encontrado')) {
        throw new NotFoundException(`Registro com ID ${id} não encontrado`);
      }
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new Error(`Erro ao atualizar ${String(this.modelName)}: ${error.message}`);
    }
  }
  
  // async findAll(
  //   paginate?: Paginate,
  //   options: CrudServiceOptions = {},
  // ): Promise<R[]> {
  //   const pagination = calculatePagination(paginate);
  //   const filteredOptions = this.filterOptions(options);
  //   const entities = await this.repository.findMany({
  //     ...pagination,
  //     ...filteredOptions,
  //   });
  //   return entities.map((entity) => this.mapToResponse(entity));
  // }

  async findAndCountAll(
    paginate?: Paginate,
    options: CrudServiceOptions = {},
  ): Promise<{ data: R[]; count: number }> {
    const pagination = calculatePagination(paginate);
    const filteredOptions = this.filterOptions(options);

    const [data, count] = await this.prisma.$transaction([
      this.repository.findMany({ ...pagination, ...filteredOptions }),
      this.repository.count({ where: filteredOptions.where }),
    ]);

    return { data: data.map((entity) => this.mapToResponse(entity)), count };
  }

  async findOneById(id: number): Promise<R | null> {
    const entity = await this.repository.findFirst({
      where: { id },
    });
  
    return entity ? this.mapToResponse(entity) : null;
  }
  

  async delete(
    id: number,
  ): Promise<R> {
    try {
      // Busca o registro antes de deletar para o log
      const recordToDelete = await this.repository.findUnique({
        where: { id },
      });

      const deletedEntity = await this.repository.delete({
        where: { id },
      });

      return this.mapToResponse(deletedEntity);
    } catch (error) {
      throw new BadRequestException('Item não encontrado ou já deletado');
    }
  }

  async deactivate(
    id: number,
    modifiedBy: string,
  ): Promise<R> {
    try {
      // Verifica se o registro existe
      const existingRecord = await this.prisma[String(this.modelName)].findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new Error(`Registro com ID ${id} não encontrado`);
      }

      // Atualiza o campo ativo
      const updatedEntity = await this.prisma[String(this.modelName)].update({
        where: { id },
        data: {
          ativo: false,
          modifiedBy,
          dateModified: new Date(),
        },
      });

      return plainToInstance(this.responseClass, updatedEntity, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new Error(`Erro ao desativar ${String(this.modelName)}: ${error.message}`);
    }
  }

  async activate(
    id: number,
    modifiedBy: string,
  ): Promise<R> {
    try {
      // Verifica se o registro existe
      const existingRecord = await this.prisma[String(this.modelName)].findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new Error(`Registro com ID ${id} não encontrado`);
      }

      // Atualiza o campo ativo
      const updatedEntity = await this.prisma[String(this.modelName)].update({
        where: { id },
        data: {
          ativo: true,
          modifiedBy,
          dateModified: new Date(),
        },
      });

      return plainToInstance(this.responseClass, updatedEntity, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new Error(`Erro ao ativar ${String(this.modelName)}: ${error.message}`);
    }
  }

  async findAndCountByUserId(
    userId: number,
    paginate?: Paginate,
    options: CrudServiceOptions = {},
  ): Promise<{ data: R[]; count: number }> {
    const pagination = calculatePagination(paginate);
  
    const where = {
      ...options.where,
      idUsuario: userId,
    };
  
    const [entities, count] = await this.prisma.$transaction([
      this.repository.findMany({ ...pagination, where }),
      this.repository.count({ where }),
    ]);
  
    const transformedData = plainToInstance(this.responseClass, entities, {
      excludeExtraneousValues: true,
    }) as R[]; 
  
    return { data: transformedData, count };
  }
}
