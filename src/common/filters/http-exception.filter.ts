import {
ExceptionFilter,
Catch,
ArgumentsHost,
HttpException,
HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

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
        customMessage = 'Access denied. You do not have permission.';
        break;
    case HttpStatus.NOT_FOUND:
        customMessage = 'The requested resource was not found.';
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
