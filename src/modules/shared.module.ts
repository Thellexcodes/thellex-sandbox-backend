import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistoryService } from './transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { QWalletsEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { YellowCardService } from './payments/yellowcard.service';
import { QwalletService } from './wallets/qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { SettingsModule } from './settings/settings.module';
import { BankAccountEntity } from '@/utils/typeorm/entities/settings/bank-account.entity';
import { UserSettingEntity } from '@/utils/typeorm/entities/settings/user.settings.entity';
import { JwtService } from '@nestjs/jwt';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';
import { CwalletHooksModule } from './webhooks/cwallet-hooks/cwallet-hooks.module';
import { QwalletHooksModule } from './webhooks/qwallet-hooks/qwallet-hooks.module';
import { EtherService } from '@/utils/services/ethers.service';
import { FiatCryptoRampTransactionEntity } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { YcPaymentHookModule } from './webhooks/yc-payments-hooks/yc-payments-hooks.module';
import { PaymentsService } from './payments/payments.service';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { TronService } from '@/utils/services/tron.service';
import { ConfigService } from '@/config/config.service';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
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
      FiatCryptoRampTransactionEntity,
    ]),
    CwalletHooksModule,
    QwalletHooksModule,
    SettingsModule,
    YcPaymentHookModule,
  ],
  providers: [
    EtherService,
    TransactionHistoryService,
    YellowCardService,
    QwalletService,
    JwtService,
    HttpService,
    PaymentsService,
    NotificationsService,
    NotificationsGateway,
    TronService,
    ConfigService,
  ],
  exports: [
    EtherService,
    TypeOrmModule,
    TransactionHistoryService,
    YellowCardService,
    QwalletService,
    HttpService,
    JwtService,
    PaymentsService,
    NotificationsService,
    NotificationsGateway,
    TronService,
    ConfigService,
  ],
})
export class SharedModule {}
