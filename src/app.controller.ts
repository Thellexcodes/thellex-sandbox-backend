import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { VersionedController001 } from './modules/controller/base.controller';
import { CustomHttpException } from './middleware/custom.http.exception';

@ApiExcludeController()
@VersionedController001('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  getHelloPost(@Body() body): string {
    console.log(body);
    return this.appService.getHello();
  }
}
