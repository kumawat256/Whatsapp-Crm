import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Catches everything, not just HttpException. Known application errors
// (BadRequestException, NotFoundException, etc.) pass their existing
// status/body straight through — this changes nothing about their
// behavior. Anything else is a genuine bug: log it server-side with
// enough context to debug (method, URL, user), but never leak the raw
// error message or stack trace to the client.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    // Gateways (WhatsApp/Inbox) already catch their own errors internally
    // and never rely on this filter — restricting to HTTP avoids calling
    // Express-only response methods on a socket.io context.
    if (host.getType() !== 'http') {
      this.logger.error(
        `Unhandled non-HTTP exception: ${exception instanceof Error ? exception.stack : String(exception)}`,
      );
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
      return;
    }

    const detail =
      exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url} (user=${request.user?.id ?? 'anonymous'}): ${detail}`,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
