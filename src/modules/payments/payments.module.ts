import { Module } from '@nestjs/common';
import { PaymentsService } from './v1/payments.service';
import { HttpService } from '@/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.service';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { VfdService } from './v2/vfd.service';
import { PaymentsController } from './v1/payments.controller';

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
    VfdService,
  ],
  exports: [VfdService],
})
export class PaymentsModule {}
