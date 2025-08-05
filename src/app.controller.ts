import { Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { VersionedController001 } from './modules/controller/base.controller';
import { CustomRequest } from './models/request.types';

@ApiExcludeController()
@VersionedController001('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: CustomRequest): string {
    return this.appService.getHello();
  }

  @Post()
  getHelloPost(): string {
    return this.appService.getHello();
  }
}
