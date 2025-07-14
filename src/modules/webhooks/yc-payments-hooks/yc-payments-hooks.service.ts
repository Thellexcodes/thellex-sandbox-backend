import { Injectable } from '@nestjs/common';
import { YcCreatePaymentHookDto } from './dto/yc-payment-hook.dto';
import { PaymentsService } from '@/modules/payments/payments.service';
import { toUTCString } from '@/utils/helpers';
import { PaymentStatus } from '@/models/payment.types';

@Injectable()
export class YcPaymentHookService {
  constructor(private readonly paymentService: PaymentsService) {}

  async handleSuccessfulCollectionRequest(dto: YcCreatePaymentHookDto) {
    await this.paymentService.updateTransactionBySequenceId(dto.sequenceId, {
      paymentStatus: PaymentStatus.Complete,
      updatedAt: toUTCString(dto.executedAt),
    });

    //[x]send notication and transaction
  }

  async handleSuccessfulPaymentRequest(dto: YcCreatePaymentHookDto) {
    await this.paymentService.updateTransactionBySequenceId(dto.sequenceId, {
      paymentStatus: PaymentStatus.Complete,
      updatedAt: toUTCString(dto.executedAt),
    });

    //[x]send notication and transaction
  }
}
