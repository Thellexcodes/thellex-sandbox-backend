import { Module } from '@nestjs/common';
import { WalletManagerService } from './wallet-manager.service';
import { WalletManagerController } from './wallet-manager.controller';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/v1/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { UserService } from '../../users/user.service';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../email/mail.service';
import { TransactionHistoryService } from '../../transaction-history/transaction-history.service';
import { CwalletService } from '../cwallet/cwallet.service';
import { TransactionHistoryEntity } from '@/v1/utils/typeorm/entities/transactions/transaction-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      QWalletProfileEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
    ]),
  ],
  controllers: [WalletManagerController],
  providers: [
    HttpService,
    UserService,
    JwtService,
    MailService,
    QwalletService,
    WalletManagerService,
    TransactionHistoryService,
    CwalletService,
  ],
})
export class WalletManagerModule {}
