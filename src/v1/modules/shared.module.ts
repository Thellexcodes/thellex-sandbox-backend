import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistoryService } from './transaction-history/transaction-history.service';
import { DeviceEntity } from '@/v1/utils/typeorm/entities/device.entity';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { QWalletsEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { TokenEntity } from '@/v1/utils/typeorm/entities/token/token.entity';
import { NotificationEntity } from '@/v1/utils/typeorm/entities/notification.entity';
import { YellowCardService } from './payments/yellowcard.service';
import { QwalletService } from './wallets/qwallet/qwallet.service';
import { HttpService } from '@/v1/middleware/http.service';
import { SettingsModule } from './settings/settings.module';
import { BankAccountEntity } from '@/v1/utils/typeorm/entities/settings/bank-account.entity';
import { UserSettingEntity } from '@/v1/utils/typeorm/entities/settings/user.settings.entity';
import { JwtService } from '@nestjs/jwt';
import { CwalletProfilesEntity } from '@/v1/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/v1/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { AuthEntity } from '@/v1/utils/typeorm/entities/auth.entity';
import { CwalletHooksModule } from './webhooks/cwallet-hooks/cwallet-hooks.module';
import { QwalletHooksModule } from './webhooks/qwallet-hooks/qwallet-hooks.module';
import { EtherService } from '@/v1/utils/services/ethers.service';
import { FiatCryptoRampTransactionEntity } from '@/v1/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { YcPaymentHookModule } from './webhooks/yc-payments-hooks/yc-payments-hooks.module';
import { PaymentsService } from './payments/payments.service';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { TronService } from '@/v1/utils/services/tron.service';
import { ConfigService } from '@/v1/config/config.service';
import { MapleradService } from './payments/maplerad.service';
import { BankingNetworkEntity } from '@/v1/utils/typeorm/entities/banking/banking-network.entity';
import { CustomConfigModule } from '@/v1/config/config.module';
import { MpPaymentHooksModule } from './webhooks/mp-payment-hooks/mp-payment-hooks.module';
import { TransactionHistoryEntity } from '@/v1/utils/typeorm/entities/transactions/transaction-history.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionEntity } from '@/v1/utils/typeorm/entities/transactions/transaction.entity';
import { TransactionsService } from './transactions/transactions.service';
import { DevicesModule } from './devices/devices.module';
import { DevicesService } from './devices/devices.service';
import { AdminModule } from './admin/admin.module';

@Global()
@Module({
  imports: [
    CustomConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      AuthEntity,
      TokenEntity,
      DeviceEntity,
      QWalletsEntity,
      CwalletsEntity,
      BankAccountEntity,
      UserSettingEntity,
      TransactionEntity,
      NotificationEntity,
      BankingNetworkEntity,
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
    MpPaymentHooksModule,
    TransactionsModule,
    DevicesModule,
    AdminModule,
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
    MapleradService,
    TransactionsService,
    DevicesService,
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
    MapleradService,
    TransactionsService,
    DevicesService,
  ],
})
export class SharedModule {}
