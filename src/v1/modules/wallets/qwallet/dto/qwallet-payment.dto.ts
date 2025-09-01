import { PaymentStatus } from '@/v1/models/payment.types';
import { ApiProperty } from '@nestjs/swagger';

export class QwalletPaymentTransactionDto {
  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  confirmations: number;

  @ApiProperty()
  required_confirmations: number;
}
