import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { VersionedController001 } from './modules/controller/base.controller';

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
