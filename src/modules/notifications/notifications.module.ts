import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AuthNotificationCronService } from '../crons/authentication/user.notification.cron';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QWalletRequestPaymentsCronService } from '../crons/qwallet/qwalletRequesPayments.cron';
import { QWalletWidthrawPaymentsCronService } from '../crons/qwallet/qWalletWithdrawPayments.cron';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.service';
import { HttpService } from '@/middleware/http.service';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { UserService } from '../users/v1/user.service';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      UserEntity,
      QWalletProfileEntity,
      AuthVerificationCodesEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    QWalletRequestPaymentsCronService,
    QWalletWidthrawPaymentsCronService,
    AuthNotificationCronService,
    QwalletService,
    UserService,
    JwtService,
    MailService,
    HttpService,
    CwalletService,
  ],
})
export class NotificationsModule {}
