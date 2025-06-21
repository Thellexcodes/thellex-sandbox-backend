import { ENV_TESTNET } from '@/constants/env';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from 'src/utils/typeorm/entities/user.entity';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QWalletsEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { BankAccountEntity } from '@/utils/typeorm/entities/settings/bank-account.entity';
import { UserSettingEntity } from '@/utils/typeorm/entities/settings/user.settings.entity';
import { PayoutSettingEntity } from '@/utils/typeorm/entities/settings/payout-settings.entity';
import { TaxSettingEntity } from '@/utils/typeorm/entities/settings/tax.entity';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';

export const typeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isTestNet = configService.get<string>('NODE_ENV') === ENV_TESTNET;

  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST'),
    port: configService.get<number>('POSTGRES_PORT'),
    username: configService.get<string>('POSTGRES_USER'),
    database: configService.get<string>('POSTGRES_DATABASE'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    entities: [
      KycEntity,
      UserEntity,
      TokenEntity,
      AuthEntity,
      DeviceEntity,
      CwalletsEntity,
      QWalletsEntity,
      TaxSettingEntity,
      BankAccountEntity,
      UserSettingEntity,
      NotificationEntity,
      PayoutSettingEntity,
      CardManagementEntity,
      CwalletProfilesEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
    ],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
    synchronize: isTestNet,
    autoLoadEntities: true,
    logging: false,
    // ssl: isTestNet ? { rejectUnauthorized: false } : false,
  };
};
