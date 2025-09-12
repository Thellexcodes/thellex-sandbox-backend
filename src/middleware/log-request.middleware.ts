import { isDev } from '@/utils/helpers';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import chalk from 'chalk';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LogRequestMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (isDev) {
      this.logger.log(
        chalk.redBright(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
        ),
      );
    }
    next();
  }
}
