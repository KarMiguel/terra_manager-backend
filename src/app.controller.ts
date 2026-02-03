import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Endpoint de verificação de saúde da API',
    description: 'Retorna uma mensagem simples indicando que a API está funcionando. Útil para verificar se o servidor está online.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API está funcionando',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
