import { Web3Service } from '@/utils/services/web3.service';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/cwallet/cwallet.entity';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistoryService } from './transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/auth.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { QWalletsEntity } from '@/utils/typeorm/entities/qwallet/qwallets.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { FiatYellowcardModule } from './fiat-yellowcard/fiat-yellowcard.module';
import { CwalletHooksModule } from './cwallet-hooks/cwallet-hooks.module';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { WalletNotificationsService } from './notifications/wallet-notifications.service';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { QWalletAddressFixerService } from './qwallet/qwallet-address-fixes.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CwalletProfilesEntity,
      CwalletsEntity,
      TransactionHistoryEntity,
      AuthnEntity,
      DeviceEntity,
      AuthVerificationCodesEntity,
      QWalletsEntity,
      QWalletProfileEntity,
      TokenEntity,
      NotificationEntity,
    ]),
    FiatYellowcardModule,
    CwalletHooksModule,
  ],
  providers: [
    Web3Service,
    NotificationsGateway,
    TransactionHistoryService,
    WalletNotificationsService,
    QWalletAddressFixerService,
  ],
  exports: [
    Web3Service,
    TypeOrmModule,
    NotificationsGateway,
    TransactionHistoryService,
    WalletNotificationsService,
    QWalletAddressFixerService,
  ],
})
export class SharedModule {}
