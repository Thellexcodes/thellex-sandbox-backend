import { BankInfoDto } from '../modules/payments/dto/fiat-to-crypto-request.dto';
import { RampReciepientInfoDto } from '../utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { PaymentStatus, TransactionTypeEnum } from './payment.types';

export class RampTransactionDTO {
  rampId: string;
  txnID: string;
  mainCryptoAmount: number;
  mainFiatAmount: number;
  transactionType: TransactionTypeEnum;
  userUID: number;
  approved: Boolean;
  paymentStatus: PaymentStatus;
  sequenceId: string;
  createdAt: Date;
  recipientInfo: RampReciepientInfoDto;
}

export type AllRampTransactions = RampTransactionDTO[];

class Revenue {
  title: string;
  total: string;
}
export class RevenuesDTO {
  totalRevenue?: Revenue;
  fiatRevenue: Revenue;
  cryptoRevenue: Revenue;
}
