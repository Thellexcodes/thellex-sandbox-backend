import { Controller, Post, Body, Req, Res, Logger, Get } from '@nestjs/common';
import { normalizeEnumValue, responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { ApiTags } from '@nestjs/swagger';
import { YcPaymentHookService } from './yc-payments-hooks.service';
import { YcCreatePaymentHookDto } from './dto/yc-payment-hook.dto';
import { RampPaymentEventEnum } from '@/models/payment.types';

//[x] properly update hooks
@ApiTags('Web Hooks')
@Controller('yc-payments-hooks')
export class YcPaymentsHookController {
  private readonly logger = new Logger(YcPaymentsHookController.name);

  constructor(private readonly ycPaymentsHooksService: YcPaymentHookService) {}

  @Post()
  create(
    @Body() dto: YcCreatePaymentHookDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const normalizedEvent = normalizeEnumValue(dto.event, RampPaymentEventEnum);

    //[x] handle failed
    //[x] handled processing
    switch (normalizedEvent) {
      case RampPaymentEventEnum.COLLECTION_COMPLETE:
        this.ycPaymentsHooksService.handleSuccessfulCollectionRequest(dto);
        break;
      case RampPaymentEventEnum.PAYMENT_COMPLETE:
        this.ycPaymentsHooksService.handleSuccessfulPaymentRequest(dto);
        break;
      default:
        this.logger.warn(`Unhandled payment status: ${dto.status}`);
        break;
    }

    return responseHandler('', res, req);
  }
}
