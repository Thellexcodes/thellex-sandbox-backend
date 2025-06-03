import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
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
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    QwalletService,
    HttpService,
    UserService,
    JwtService,
    MailService,
  ],
})
export class PaymentsModule {}
