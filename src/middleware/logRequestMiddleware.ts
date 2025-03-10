import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'development') {
      // console.log(`Request received at ${req.originalUrl} [${req.method}]`);
    }
    next();
  }
}
