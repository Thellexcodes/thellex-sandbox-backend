import {
  Injectable,
  NestInterceptor,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(_, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          throw error;
        } else if (error instanceof Error) {
          throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        } else {
          console.log(error.message, '3');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }),
    );
  }
}
