import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AuthNotificationCronService } from '../crons/authentication/user.notification.cron';
import { NotificationEntity } from '@/v1/utils/typeorm/entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QWalletRequestPaymentsCronService } from '../crons/qwallet/qwalletRequesPayments.cron';
import { QWalletWidthrawPaymentsCronService } from '../crons/qwallet/qWalletWithdrawPayments.cron';
import { UserService } from '../users/user.service';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.service';
import { HttpService } from '@/v1/middleware/http.service';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';

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
