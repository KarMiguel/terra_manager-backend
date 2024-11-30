import {
  Injectable,
  Query,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import { Paginate } from '../src/common/utils/types';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Injectable()
export abstract class CrudController<T extends object, R extends object = T> {
  constructor(private readonly service: CrudService<T, R>) {}
  
  @Post()
  async create(@Body() body: T): Promise<R> {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<T>): Promise<R> {
    return this.service.update(+id, body);
  }

  @Get()
  async findAll(
    @Query('options') options?: string,
    @Query('paginate') paginate?: Paginate,
  ): Promise<R[]> {
    try {
      const parsedOptions = options ? JSON.parse(options) : {};
      return this.service.findAll(paginate, parsedOptions);
    } catch (error) {
      throw new Error('O parâmetro "options" deve ser um JSON válido.');
    }
  }
  
  @Get('list/count/all')
  async listCountAll(
    @Query('options') options?: string,
    @Query('paginate') paginate?: Paginate,
  ): Promise<{ data: R[]; count: number }> {
  try {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.service.findAndCountAll(paginate, parsedOptions);
  } catch (error) {
    throw new Error('O parâmetro "options" deve ser um JSON válido.');
  }
}

  @Get('count')
  async count(@Query('options') options?: Record<string, any>): Promise<number> {
    return this.service.count(options);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<R | null> {
    if (!id) {
      throw new Error('O parâmetro "id" é obrigatório.');
    }
  
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error('O parâmetro "id" deve ser um número válido.');
    }
  
    return this.service.findOneById(numericId);
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<R> {
    return this.service.delete(+id);
  }
}
