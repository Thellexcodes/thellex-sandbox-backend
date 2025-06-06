import { Module } from '@nestjs/common';
import { WalletManagerService } from './wallet-manager.service';
import { WalletManagerController } from './wallet-manager.controller';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet.entity';
import { UserService } from '../user/user.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QwalletEntity,
      UserEntity,
      AuthVerificationCodesEntity,
    ]),
  ],
  controllers: [WalletManagerController],
  providers: [
    WalletManagerService,
    QwalletService,
    HttpService,
    UserService,
    JwtService,
    MailService,
  ],
})
export class WalletManagerModule {}
