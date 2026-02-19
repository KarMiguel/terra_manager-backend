import {
ExceptionFilter,
Catch,
ArgumentsHost,
HttpException,
HttpStatus,
ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Detecta erros de unique constraint do Prisma
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        // Unique constraint violation
        const target = exception.meta?.target as string[] | undefined;
        const field = target ? target.join(', ') : 'campo único';
        exception = new ConflictException(
          `Já existe um registro com o(s) valor(es) informado(s) para ${field}.`
        );
      }
    }

    const status =
    exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let customMessage;
    
    switch (status) {
    case HttpStatus.BAD_REQUEST:
        customMessage = 'Invalid request parameters.';
        break;
    case HttpStatus.UNAUTHORIZED:
        customMessage = 'Unauthorized. Please login to access this resource.';
        break;
    case HttpStatus.FORBIDDEN:
        customMessage =
          exception instanceof HttpException && typeof exception.getResponse() === 'object' && (exception.getResponse() as any)?.message
            ? (Array.isArray((exception.getResponse() as any).message) ? (exception.getResponse() as any).message[0] : (exception.getResponse() as any).message)
            : 'Acesso negado. Este recurso exige um plano específico para acessar.';
        break;
    case HttpStatus.NOT_FOUND:
        customMessage = 'The requested resource was not found.';
        break;
    case HttpStatus.CONFLICT:
        customMessage = exception.message || 'Conflict. The resource already exists.';
        break;
    case HttpStatus.UNPROCESSABLE_ENTITY:
        customMessage =
        'Validation failed. Please check the provided data and try again.';
        break;
    case HttpStatus.TOO_MANY_REQUESTS:
        customMessage = 'Too many requests. Please try again later.';
        break;
    case HttpStatus.INTERNAL_SERVER_ERROR:
        customMessage = 'A server error occurred. Please contact support.';
        break;
    default:
        customMessage =
        exception instanceof HttpException
            ? exception.getResponse()
            : customMessage;
    }

    const errorResponse = {
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
    message: customMessage,
    details:
        exception.response?.message || exception.message || 'No additional details',
    };

    console.error({
    exception,
    context: {
        path: request.url,
        method: request.method,
        status,
    },
    });

    response.status(status).json(errorResponse);
    }
}
