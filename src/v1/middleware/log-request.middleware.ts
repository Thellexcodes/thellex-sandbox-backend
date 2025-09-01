import { getEnv } from '@/v1/constants/env';
import { ENV_PRODUCTION } from '@/v1/models/settings.types';
import { Injectable, NestMiddleware } from '@nestjs/common';
import chalk from 'chalk';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (getEnv() !== ENV_PRODUCTION) {
      console.log(
        chalk.redBright(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
        ),
      );
    }
    next();
  }
}
