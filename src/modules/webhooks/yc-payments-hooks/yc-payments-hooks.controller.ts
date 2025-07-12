import { Controller, Post, Body, Req, Res, Logger } from '@nestjs/common';
import {
  NormalizeEnumPipe,
  normalizeEnumValue,
  responseHandler,
} from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { ApiTags } from '@nestjs/swagger';
import { YcPaymentHookService } from './yc-payments-hooks.service';
import { YcCreatePaymentHookDto } from './dto/yc-payment-hook.dto';
import { PaymentStatus, YCPaymentEventEnum } from '@/models/payment.types';

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
    const normalizedEvent = normalizeEnumValue(dto.event, YCPaymentEventEnum);

    switch (normalizedEvent) {
      case YCPaymentEventEnum.COLLECTION_COMPLETE:
        this.ycPaymentsHooksService.handleSuccessfulCollectionRequest(dto);
        break;

      default:
        this.logger.warn(`Unhandled payment status: ${dto.status}`);
        break;
    }

    return responseHandler('', res, req);
  }
}
