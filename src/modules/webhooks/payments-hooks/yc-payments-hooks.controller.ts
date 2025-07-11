import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { ApiTags } from '@nestjs/swagger';
import { YcPaymentHookService } from './yc-payments-hooks.service';

@ApiTags('Web Hooks')
@Controller('yc-payments-hooks')
export class YcPaymentsHookController {
  constructor(private readonly paymentsService: YcPaymentHookService) {}

  @Post()
  create(
    @Body() createPaymentDto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    this.paymentsService.create(createPaymentDto);
    return responseHandler('', res, req);
  }
}
