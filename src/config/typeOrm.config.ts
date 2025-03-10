import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from 'src/utils/typeorm/entities/user.entity';

export const typeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST'),
    port: configService.get<number>('POSTGRES_PORT'),
    username: configService.get<string>('POSTGRES_USER'),
    database: configService.get<string>('POSTGRES_DATABASE'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    entities: [
      UserEntity,
      AuthVerificationCodesEntity,
      AuthnEntity,
      DeviceEntity,
    ],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
    synchronize: isDev,
    autoLoadEntities: true,
    logging: false,
    ssl: isDev ? { rejectUnauthorized: false } : true,
  };
};
