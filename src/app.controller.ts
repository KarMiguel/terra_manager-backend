import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Informações da API',
    description: 'Retorna informações básicas da API e link para documentação Swagger.',
  })
  @ApiResponse({
    status: 200,
    description: 'API online',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Terra Manager API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'API para gerenciamento agrícola' },
        status: { type: 'string', example: 'online' },
        docs: { type: 'string', example: '/api-docs' },
        timestamp: { type: 'string', example: '2026-02-21T00:00:00.000Z' },
      },
    },
  })
  getInfo() {
    return this.appService.getInfo();
  }
}
