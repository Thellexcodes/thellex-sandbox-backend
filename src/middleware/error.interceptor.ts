import {
  Injectable,
  NestInterceptor,
  CallHandler,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const isExpected = error instanceof Error;
        const message = isExpected ? error.message : 'Internal server error';

        return throwError(
          () => new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }),
    );
  }
}
