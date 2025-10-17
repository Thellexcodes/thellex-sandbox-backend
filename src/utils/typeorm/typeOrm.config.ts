import { getAppConfig } from '@/constants/env';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { QWalletsEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { UserSettingEntity } from '@/utils/typeorm/entities/settings/user.settings.entity';
import { PayoutSettingEntity } from '@/utils/typeorm/entities/settings/payout-settings.entity';
import { TaxSettingEntity } from '@/utils/typeorm/entities/settings/tax.entity';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';
import { FiatCryptoRampTransactionEntity } from './entities/fiat-crypto-ramp-transaction.entity';
import { BankingNetworkEntity } from './entities/banking/banking-network.entity';
import { TransactionHistoryEntity } from './entities/transactions/transaction-history.entity';
import { TransactionEntity } from './entities/transactions/transaction.entity';
import { BetaTesterEntity } from './entities/beta.testers.entity';
import { isDev, isProd } from '../helpers';
import { FiatWalletProfileEntity } from './entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { FiatWalletEntity } from './entities/wallets/fiatwallet/fiatwallet.entity';
import { UserEntity } from './entities/user/user.entity';
import { UserSecurityEntity } from './entities/user/user.security.entity';

export const typeOrmConfig = async (): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: getAppConfig().POSTGRES.HOST,
    port: getAppConfig().POSTGRES.PORT,
    username: getAppConfig().POSTGRES.USER,
    database: getAppConfig().POSTGRES.DATABASE,
    password: getAppConfig().POSTGRES.PASSWORD,
    entities: [
      KycEntity,
      AuthEntity,
      UserEntity,
      TokenEntity,
      DeviceEntity,
      CwalletsEntity,
      QWalletsEntity,
      FiatWalletEntity,
      BetaTesterEntity,
      TaxSettingEntity,
      TransactionEntity,
      UserSettingEntity,
      UserSecurityEntity,
      NotificationEntity,
      PayoutSettingEntity,
      CardManagementEntity,
      BankingNetworkEntity,
      CwalletProfilesEntity,
      FiatWalletProfileEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
      FiatCryptoRampTransactionEntity,
    ],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
      max: 20,
      connectionTimeoutMillis: 5000,
    },
    synchronize: isDev,
    autoLoadEntities: true,
    logging: false,
    ssl: isProd ? { rejectUnauthorized: true } : false,
  };
};
