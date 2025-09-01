import { Module } from '@nestjs/common';
import { YcPaymentsHookController } from './yc-payments-hooks.controller';
import { YcPaymentHookService } from './yc-payments-hooks.service';
import { PaymentsService } from '@/v1/modules/payments/payments.service';

@Module({
  controllers: [YcPaymentsHookController],
  providers: [YcPaymentHookService],
})
export class YcPaymentHookModule {}
