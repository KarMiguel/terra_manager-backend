import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { calculatePagination } from '../src/common/utils/calculatePagination';
import { Paginate } from '../src/common/utils/types';


@Injectable()
export abstract class CrudService<T> {
  constructor(
    protected readonly prisma: PrismaClient,
    private readonly modelName: keyof PrismaClient,
  ) {}

  private get repository() {
    return this.prisma[this.modelName] as any;
  }

  async create(data: T) {
    return this.repository.create({ data });
  }

  async update(id: number, data: Partial<T>) {
    return this.repository.update({
      where: { id },
      data,
    });
  }

  async findAll(paginate?: Paginate, options?: Record<string, any>) {
    const pagination = calculatePagination(paginate);
    return this.repository.findMany({
      ...pagination,
      ...options,
    });
  }

  async findAndCountAll(paginate?: Paginate, options?: Record<string, any>) {
    const pagination = calculatePagination(paginate);
    const [data, count] = await this.prisma.$transaction([
      this.repository.findMany({ ...pagination, ...options }),
      this.repository.count({ where: options?.where }),
    ]);
    return { data, count };
  }

  async isUnique(where: Record<string, any>, id?: number) {
    const foundItem = await this.repository.findUnique({ where });

    if (foundItem) {
      return id && foundItem.id === id;
    }
    return true;
  }

  async count(options?: Record<string, any>) {
    return this.repository.count({
      where: options?.where,
    });
  }

  async findOne(options: Record<string, any>) {
    return this.repository.findFirst({
      ...options,
    });
  }

  async findByPk(id: number, options?: Record<string, any>) {
    return this.repository.findUnique({
      where: { id },
      ...options,
    });
  }

  async delete(id: number) {
    try {
      return await this.repository.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Item not found or already deleted');
    }
  }
}