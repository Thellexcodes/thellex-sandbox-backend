import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { MailService } from '../email/mail.service';
import { HttpService } from '@/middleware/http.service';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { UserControllerV2 } from './v2/v2.user.controller';
import { UserServiceV2 } from './v2/v2.user.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { FiatwalletService } from '../wallets/fiatwallet/fiatwallet.service';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { FiatWalletEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwallet.entity';
import { VfdService } from '../payments/v2/vfd.service';
import { DynamicRepositoryService } from '@/utils/DynamicSource';
import { UserController } from './v1/user.controller';
import { UserService } from './v1/user.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthVerificationCodesEntity,
      FiatWalletProfileEntity,
      FiatWalletEntity,
    ]),
  ],
  controllers: [UserController, UserControllerV2],
  providers: [
    UserService,
    UserServiceV2,
    MailService,
    QwalletService,
    HttpService,
    CwalletService,
    VfdService,
    FiatwalletService,
    DynamicRepositoryService,
  ],
  exports: [UserService, UserServiceV2, VfdService, DynamicRepositoryService],
})
export class UserModule {}
