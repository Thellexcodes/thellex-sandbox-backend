import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthnService } from './auth.service';
import { UserService } from '../users/user.service';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { MailService } from '../email/mail.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { HttpService } from '@/middleware/http.service';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthEntity,
      DeviceEntity,
      QWalletProfileEntity,
      AuthVerificationCodesEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(),
      }),
      inject: [],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthnService,
    UserService,
    MailService,
    QwalletService,
    HttpService,
    CwalletService,
  ],
  exports: [AuthnService],
})
export class AuthModule {}
