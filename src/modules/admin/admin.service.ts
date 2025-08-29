import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { TransactionTypeEnum } from '@/models/payment.types';
import { AllRampTransactions, AllRevenuDto } from '@/models/admin.types';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async allRevenues(): Promise<AllRevenuDto> {
    return [
      {
        totalRevenue: {
          title: 'total revenue',
          total: '8000 USD',
        },
        fiatRevenue: {
          title: 'fiat revenue',
          total: '50,000 NGN',
        },
        cryptoRevnue: {
          title: 'crypto revenue',
          total: '100,000 USD',
        },
      },
    ];
  }

  async allRampTransactions(): Promise<AllRampTransactions> {
    return [
      {
        rampId: 'dfadsf',
        txnID: '',
        mainCryptoAmount: 1,
        mainFiatAmount: 1,
        transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
        userUID: 1,
        providerTransactionID: '',
        approved: true,
      },
    ];
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
