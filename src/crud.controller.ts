import { Injectable, Query, Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CrudService } from './crud.service';
import { Paginate } from '../src/common/utils/types';

@Injectable()
export abstract class CrudController<T> {
  constructor(private readonly service: CrudService<T>) {}

  @Post()
  async create(@Body() body: T) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<T>) {
    return this.service.update(+id, body);
  }

  @Get()
  async findAll(
    @Query('options') options?: Record<string, any>,
    @Query('paginate') paginate?: Paginate,
  ) {
    return this.service.findAll(paginate, options);
  }

  @Get('list/count/all')
  async listCountAll(
    @Query('options') options?: Record<string, any>,
    @Query('paginate') paginate?: Paginate,
  ) {
    return this.service.findAndCountAll(paginate, options);
  }

  @Get('count')
  async count(@Query('options') options?: Record<string, any>) {
    return this.service.count(options);
  }

  @Get('findOne')
  async findOne(@Query('options') options?: Record<string, any>) {
    return this.service.findOne(options);
  }

  @Get(':id')
  async findByPk(@Param('id') id: string, @Query('options') options?: Record<string, any>) {
    return this.service.findByPk(+id, options);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
