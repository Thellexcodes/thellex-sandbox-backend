import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { HttpService } from '@/v1/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.service';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
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
