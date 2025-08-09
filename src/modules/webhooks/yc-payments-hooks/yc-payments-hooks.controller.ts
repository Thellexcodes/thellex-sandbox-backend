import { Controller, Post, Body, Req, Res, Logger, Get } from '@nestjs/common';
import { normalizeEnumValue, responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { YcPaymentHookService } from './yc-payments-hooks.service';
import { YcHookDataDto } from './dto/yc-hook-data.dto';
import { YCRampPaymentEventEnum } from '@/models/payment.types';

//[x] properly update hooks
@ApiTags('Web Hooks')
@Controller('yc-payments-hooks')
export class YcPaymentsHookController {
  private readonly logger = new Logger(YcPaymentsHookController.name);

  constructor(private readonly ycPaymentsHooksService: YcPaymentHookService) {}

  @Get()
  hello(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    return responseHandler('Hello world', res, req);
  }

  @Post()
  @ApiBody({
    description: 'YC webhook event data',
    type: YcHookDataDto,
  })
  async create(
    @Body() dto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    // console.log({ dto });

    const normalizedEvent = normalizeEnumValue(
      dto.event,
      YCRampPaymentEventEnum,
    );

    switch (normalizedEvent) {
      //collection
      case YCRampPaymentEventEnum.COLLECTION_COMPLETE:
        await this.ycPaymentsHooksService.handleSuccessfulCollectionRequest(
          dto,
        );
        break;
      case YCRampPaymentEventEnum.COLLECTION_FAILED:
        await this.ycPaymentsHooksService.handleFailedCollectionRequest(dto);
        break;

      //payments
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
