import { Global, Module } from '@nestjs/common';
import { CardManagementService } from './card-management.service';
import { CardManagementController } from './card-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConfigurations } from '@/v1/config/jwt.config';
import { MailService } from '../email/mail.service';
import { StellarService } from '../stellar/stellar.service';
import { CardManagementEntity } from '../../utils/typeorm/entities/card-management.entity';
import { HttpService } from '@/v1/middleware/http.service';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { AuthEntity } from '@/v1/utils/typeorm/entities/auth.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthEntity,
      AuthVerificationCodesEntity,
      CardManagementEntity,
      QWalletProfileEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(),
      }),
      inject: [],
    }),
  ],
  controllers: [CardManagementController],
  providers: [
    CardManagementService,
    MailService,
    StellarService,
    QwalletService,
    HttpService,
  ],
  exports: [CardManagementService],
})
export class CardManagementModule {}
