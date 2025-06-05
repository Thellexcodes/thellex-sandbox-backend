import { ApiProperty } from '@nestjs/swagger';

export class QwalletPaymentTransactionDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  confirmations: number;

  @ApiProperty()
  required_confirmations: number;
}
