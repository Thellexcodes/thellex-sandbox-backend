import { Web3Service } from '@/utils/services/web3.service';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistoryService } from './transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { QWalletsEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { WalletNotificationsService } from './notifications/wallet-notifications.service';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { YellowCardService } from './payments/yellowcard.service';
import { CwalletHooksModule } from './wallets/cwallet-hooks/cwallet-hooks.module';
import { QwalletService } from './wallets/qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { SettingsModule } from './settings/settings.module';
import { BankAccountEntity } from '@/utils/typeorm/entities/settings/bank-account.entity';
import { UserSettingEntity } from '@/utils/typeorm/entities/settings/user.settings.entity';
import { JwtService } from '@nestjs/jwt';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthEntity,
      TokenEntity,
      DeviceEntity,
      QWalletsEntity,
      CwalletsEntity,
      BankAccountEntity,
      UserSettingEntity,
      NotificationEntity,
      QWalletProfileEntity,
      CwalletProfilesEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
    ]),
    CwalletHooksModule,
    SettingsModule,
  ],
  providers: [
    Web3Service,
    NotificationsGateway,
    TransactionHistoryService,
    WalletNotificationsService,
    YellowCardService,
    QwalletService,
    JwtService,
    HttpService,
  ],
  exports: [
    Web3Service,
    TypeOrmModule,
    NotificationsGateway,
    TransactionHistoryService,
    WalletNotificationsService,
    YellowCardService,
    QwalletService,
    HttpService,
    JwtService,
  ],
})
export class SharedModule {}
