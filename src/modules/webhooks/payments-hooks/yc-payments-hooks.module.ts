import { Module } from '@nestjs/common';
import { YcPaymentsHookController } from './yc-payments-hooks.controller';
import { YcPaymentHookService } from './yc-payments-hooks.service';

@Module({
  controllers: [YcPaymentsHookController],
  providers: [YcPaymentHookService],
})
export class YcPaymentHookModule {}
