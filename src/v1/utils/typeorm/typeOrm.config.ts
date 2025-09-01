import { getAppConfig } from '@/v1/constants/env';
import { CardManagementEntity } from '@/v1/utils/typeorm/entities/card-management.entity';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { DeviceEntity } from '@/v1/utils/typeorm/entities/device.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { NotificationEntity } from '@/v1/utils/typeorm/entities/notification.entity';
import { QWalletsEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { TokenEntity } from '@/v1/utils/typeorm/entities/token/token.entity';
import { BankAccountEntity } from '@/v1/utils/typeorm/entities/settings/bank-account.entity';
import { UserSettingEntity } from '@/v1/utils/typeorm/entities/settings/user.settings.entity';
import { PayoutSettingEntity } from '@/v1/utils/typeorm/entities/settings/payout-settings.entity';
import { TaxSettingEntity } from '@/v1/utils/typeorm/entities/settings/tax.entity';
import { AuthEntity } from '@/v1/utils/typeorm/entities/auth.entity';
import { CwalletsEntity } from '@/v1/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { CwalletProfilesEntity } from '@/v1/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { KycEntity } from '@/v1/utils/typeorm/entities/kyc/kyc.entity';
import { FiatCryptoRampTransactionEntity } from './entities/fiat-crypto-ramp-transaction.entity';
import { BankingNetworkEntity } from './entities/banking/banking-network.entity';
import { TransactionHistoryEntity } from './entities/transactions/transaction-history.entity';
import { TransactionEntity } from './entities/transactions/transaction.entity';
import { BetaTesterEntity } from './entities/beta.testers.entity';
import { isDev, isProd } from '../helpers';

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
      UserEntity,
      TokenEntity,
      AuthEntity,
      DeviceEntity,
      CwalletsEntity,
      QWalletsEntity,
      BetaTesterEntity,
      TaxSettingEntity,
      TransactionEntity,
      BankAccountEntity,
      UserSettingEntity,
      NotificationEntity,
      PayoutSettingEntity,
      CardManagementEntity,
      BankingNetworkEntity,
      CwalletProfilesEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
      FiatCryptoRampTransactionEntity,
    ],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
      max: 20, // pool size
      connectionTimeoutMillis: 5000,
    },
    synchronize: isDev,
    autoLoadEntities: true,
    logging: false,
    ssl: isProd ? { rejectUnauthorized: true } : false,
  };
};
