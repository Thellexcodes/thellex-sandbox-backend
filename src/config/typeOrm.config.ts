import { ENV_TESTNET } from '@/constants/env';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from 'src/utils/typeorm/entities/user.entity';

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
      UserEntity,
      AuthnEntity,
      DeviceEntity,
      QwalletEntity,
      CardManagementEntity,
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
