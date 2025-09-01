import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { VersionedController101 } from './v1/modules/controller/base.controller';
import { CustomRequest, CustomResponse } from './v1/models/request.types';
import { responseHandler } from './v1/utils/helpers';
// import { ClientAuthGuard } from './middleware/guards/signature.guard';

class BackendErrorDto {
  screen: string;
  errorType: string;
  message: string;
  code?: string;
  timestamp: number;
}

@VersionedController101('')
@Controller('')
// @UseGuards(ClientAuthGuard)
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
