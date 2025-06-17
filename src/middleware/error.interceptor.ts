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
        } else if (error instanceof Error) {
          return throwError(
            () =>
              new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        } else {
          console.error('Unknown error:', error);
          return throwError(
            () =>
              new HttpException(
                'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        }
      }),
    );
  }
}
