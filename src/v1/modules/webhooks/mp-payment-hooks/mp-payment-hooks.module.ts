import { Module } from '@nestjs/common';
import { MpPaymentHooksService } from './mp-payment-hooks.service';
import { MpPaymentHooksController } from './mp-payment-hooks.controller';

@Module({
  controllers: [MpPaymentHooksController],
  providers: [MpPaymentHooksService],
})
export class MpPaymentHooksModule {}
