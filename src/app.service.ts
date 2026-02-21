import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Terra Manager API',
      version: '1.0.0',
      description: 'API para gerenciamento agrícola',
      status: 'online',
      docs: '/api-docs',
      timestamp: new Date().toISOString(),
    };
  }
}
