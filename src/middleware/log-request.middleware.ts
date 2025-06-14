import { ENV_TESTNET } from '@/constants/env';
import { Injectable, NestMiddleware } from '@nestjs/common';
import chalk from 'chalk';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === ENV_TESTNET) {
      console.log(
        chalk.redBright(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
        ),
      );
    }
    next();
  }
}
