import { PaymentStatus } from '@/models/payment.types';
import { ApiProperty } from '@nestjs/swagger';

export class QwalletPaymentTransactionDto {
  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  confirmations: number;

  @ApiProperty()
  required_confirmations: number;
}
