import { PaymentStatus } from '@/types/payment.types';
import { ApiProperty } from '@nestjs/swagger';

export class QwalletPaymentTransactionDto {
  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  confirmations: number;

  @ApiProperty()
  required_confirmations: number;
}
