import { Web3Service } from '@/utils/services/web3.service';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/cwallet/cwallet.entity';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistoryService } from './transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CwalletProfilesEntity,
      CwalletsEntity,
      TransactionHistoryEntity,
    ]),
  ],
  providers: [Web3Service, TransactionHistoryService],
  exports: [TypeOrmModule, Web3Service],
})
export class SharedModule {}
