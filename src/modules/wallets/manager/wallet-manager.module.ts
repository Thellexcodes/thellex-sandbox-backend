import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transactions/transaction-history.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletManagerController } from './v1/wallet-manager.controller';
import { HttpService } from '@/middleware/http.service';
import { UserService } from '@/modules/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/modules/email/mail.service';
import { QwalletService } from '../qwallet/qwallet.service';
import { WalletManagerService } from './v1/wallet-manager.service';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { CwalletService } from '../cwallet/cwallet.service';
import { WalletManagerControllerV2 } from './v2/v2.wallet-manger.controller';
import { WalletManagerServiceV2 } from './v2/v2.wallet-manager.service';
import { FiatwalletService } from '../fiatwallet/fiatwallet.service';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { FiatWalletEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      QWalletProfileEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
      FiatWalletProfileEntity,
      FiatWalletEntity,
    ]),
  ],
  controllers: [WalletManagerController, WalletManagerControllerV2],
  providers: [
    HttpService,
    UserService,
    JwtService,
    MailService,
    QwalletService,
    WalletManagerService,
    WalletManagerServiceV2,
    TransactionHistoryService,
    FiatwalletService,
    CwalletService,
  ],
})
export class WalletManagerModule {}
