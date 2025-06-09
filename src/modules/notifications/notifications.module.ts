import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AuthNotificationCronService } from '../cronjobs/authentication/user.notification.cron';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QWalletRequestPaymentsCronService } from '../cronjobs/qwallet/qwalletRequesPayments.cron';
import { QWalletWidthrawPaymentsCronService } from '../cronjobs/qwallet/qWalletWithdrawPayments.cron';
import { NotificationsGateway } from './notifications.gateway';
import { UserService } from '../user/user.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { QwalletService } from '../qwallet/qwalletProfile.service';
import { HttpService } from '@/middleware/http.service';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';

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
    NotificationsGateway,
    UserService,
    JwtService,
    MailService,
    HttpService,
  ],
})
export class NotificationsModule {}
