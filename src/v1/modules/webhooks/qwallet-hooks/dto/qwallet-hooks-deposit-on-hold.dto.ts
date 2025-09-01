import { QWalletPaymentAddressDto } from '@/v1/modules/wallets/qwallet/dto/qwallet-address.dto';
import { QwalletPaymentTransactionDto } from '@/v1/modules/wallets/qwallet/dto/qwallet-payment.dto';
import { QwalletSubAccountDto } from '@/v1/modules/wallets/qwallet/dto/qwallet-subaccount.dto';
import { QwalletDto } from '@/v1/modules/wallets/qwallet/dto/qwallet.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QWalletHooksDepositOnHoldDto {
  @ApiProperty()
  event: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: { type: 'string' },
      currency: { type: 'string' },
      amount: { type: 'string' },
      fee: { type: 'string' },
      txid: { type: 'string' },
      status: { type: 'string' },
      reason: { type: 'string', nullable: true },
      created_at: { type: 'string' },
      done_at: { type: 'string', nullable: true },
    },
  })
  data: {
    id: string;
    type: string;
    currency: string;
    amount: string;
    fee: string;
    txid: string;
    status: string;
    reason: string | null;
    created_at: string;
    done_at: string | null;
    wallet: QwalletDto;
    user: QwalletSubAccountDto;
    payment_transaction: QwalletPaymentTransactionDto;
    payment_address: QWalletPaymentAddressDto;
  };
}
