import { Controller, Post, Body, Req, Res, Logger, Get } from '@nestjs/common';
import { normalizeEnumValue, responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { ApiTags } from '@nestjs/swagger';
import { YcPaymentHookService } from './yc-payments-hooks.service';
import { YcCreatePaymentHookDto } from './dto/yc-payment-hook.dto';
import { YCRampPaymentEventEnum } from '@/models/payment.types';

//[x] properly update hooks
@ApiTags('Web Hooks')
@Controller('yc-payments-hooks')
export class YcPaymentsHookController {
  private readonly logger = new Logger(YcPaymentsHookController.name);

  constructor(private readonly ycPaymentsHooksService: YcPaymentHookService) {}

  @Post()
  async create(
    @Body() dto: YcCreatePaymentHookDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    console.log({ event: dto.event });
    const normalizedEvent = normalizeEnumValue(
      dto.event,
      YCRampPaymentEventEnum,
    );

    console.log({ normalizedEvent });

    //[x] handle failed
    //[x] handled processing
    switch (normalizedEvent) {
      case YCRampPaymentEventEnum.COLLECTION_COMPLETE:
        await this.ycPaymentsHooksService.handleSuccessfulCollectionRequest(
          dto,
        );
        break;
      case YCRampPaymentEventEnum.PAYMENT_FAILED:
        await this.ycPaymentsHooksService.handleFailedPaymentRequest(dto);
      case YCRampPaymentEventEnum.PAYMENT_COMPLETE:
        await this.ycPaymentsHooksService.handleSuccessfulPaymentRequest(dto);
        break;
      default:
        this.logger.warn(`Unhandled payment status: ${dto.status}`);
        break;
    }

    return responseHandler('', res, req);
  }
}
