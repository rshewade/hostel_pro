import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role: string;
    email?: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.sub || 'anonymous';
    const userRole = request.user?.role || 'none';

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const latency = Date.now() - now;

          this.logger.log(
            JSON.stringify({
              method,
              path: url,
              statusCode,
              latency: `${latency}ms`,
              userId,
              userRole,
              ip,
              userAgent: userAgent.substring(0, 100),
            }),
          );
        },
        error: (error) => {
          const latency = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.warn(
            JSON.stringify({
              method,
              path: url,
              statusCode,
              latency: `${latency}ms`,
              userId,
              userRole,
              ip,
              error: error.message,
            }),
          );
        },
      }),
    );
  }
}
