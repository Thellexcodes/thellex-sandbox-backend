import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { VersionedController101 } from './modules/controller/base.controller';
import { CustomRequest, CustomResponse } from './models/request.types';
import { responseHandler } from './utils/helpers';
import { ClientAuthGuard } from './middleware/guards/client-auth.guard';

// @ApiExcludeController()
@VersionedController101('')
@Controller('')
@UseGuards(ClientAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const response = this.appService.getHello();
    responseHandler(response, res, req);
  }

  @Post('/beta/subscribe')
  async subscribeBeta(
    @Body() createSubscribeBetaDto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response = await this.appService.subscribeToBeta(
      createSubscribeBetaDto,
    );
    responseHandler(response, res, req);
  }
}
