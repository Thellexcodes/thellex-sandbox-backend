import { Injectable } from '@nestjs/common';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { TransactionTypeEnum } from '@/models/payment.types';
import { AllRampTransactions, RevenuesDTO } from '@/models/admin.types';
import { TransactionsService } from '../transactions/transactions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BetaTesterEntity } from '@/utils/typeorm/entities/beta.testers.entity';
import { TransactionEntity } from '@/utils/typeorm/entities/transactions/transaction.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(BetaTesterEntity)
    private betaTesterRepo: Repository<BetaTesterEntity>,
    private transactionService: TransactionsService,
    private paymentsService: PaymentsService,
  ) {}

  async getAllBetaTesters() {
    await this.betaTesterRepo.find();
  }

  async allRevenues(): Promise<RevenuesDTO> {
    const allTransactions = await this.transactionService.getAllRevenue();

    // Calculate the sum of cryptoAmount and fiatAmount
    const totals = allTransactions.reduce(
      (acc, transaction: Partial<TransactionEntity>) => {
        return {
          totalCryptoAmount:
            acc.totalCryptoAmount +
            parseFloat(`${transaction.cryptoAmount || 0}`),
          totalFiatAmount:
            acc.totalFiatAmount + parseFloat(`${transaction.fiatAmount || 0}`),
        };
      },
      { totalCryptoAmount: 0, totalFiatAmount: 0 },
    );

    const { totalCryptoAmount, totalFiatAmount } = totals;

    const FIAT_CONVERSION_RATE = 1500; // [x] update to YC rate for now
    const totalRevenue = (
      totalCryptoAmount +
      totalFiatAmount / FIAT_CONVERSION_RATE
    ).toFixed(2);

    return {
      totalRevenue: {
        title: 'total revenue',
        total: `${totalRevenue} USD`,
      },
      fiatRevenue: {
        title: 'fiat revenue',
        total: `${totalFiatAmount.toFixed(2)} NGN`,
      },
      cryptoRevenue: {
        title: 'crypto revenue',
        total: `${totalCryptoAmount.toFixed(2)} USD`,
      },
    };
  }

  async allRampTransactions(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: AllRampTransactions;
    total: number;
    pageNumber: number;
    lastPage: number;
  }> {
    const rampTransactionsResponse =
      await this.paymentsService.findDynamicRampTransactions({
        page,
        limit,
        selectFields: [
          'id',
          'createdAt',
          'transactionType',
          'approved',
          'sequenceId',
          'netFiatAmount',
          'netCryptoAmount',
          'paymentStatus',
          'providerTransactionId',
        ],
        joinRelations: [{ relation: 'user', selectFields: ['uid'] }],
      });

    const { lastPage, page: pageNumber, total } = rampTransactionsResponse;

    // Filter and map
    const rampTransactions = rampTransactionsResponse.data
      .filter(
        (txn) =>
          txn.transactionType === TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT ||
          txn.transactionType === TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      )
      .map((txn) => ({
        rampId: txn.providerTransactionId,
        txnID: txn.providerTransactionId,
        mainCryptoAmount: txn.netCryptoAmount,
        mainFiatAmount: txn.netFiatAmount,
        transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
        userUID: txn.user.uid,
        approved: txn.approved,
        paymentStatus: txn.paymentStatus,
        sequenceId: txn.sequenceId,
        createdAt: txn.createdAt,
      }));

    return { data: rampTransactions, lastPage, pageNumber, total };
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
