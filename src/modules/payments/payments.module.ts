import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { UserService } from '../users/user.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.service';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { CwalletService } from '../cwallet/cwallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthVerificationCodesEntity,
      QWalletProfileEntity,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    QwalletService,
    HttpService,
    UserService,
    JwtService,
    MailService,
    CwalletService,
  ],
})
export class PaymentsModule {}
