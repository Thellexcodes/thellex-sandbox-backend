import { Module } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { QwalletHooksController } from './qwallet-hooks.controller';
import { QwalletNotificationsService } from '../notifications/qwallet-notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.service';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { CwalletService } from '../cwallet/cwallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      UserEntity,
      AuthVerificationCodesEntity,
      TransactionHistoryEntity,
      QWalletProfileEntity,
    ]),
  ],
  controllers: [QwalletHooksController],
  providers: [
    QwalletHooksService,
    QwalletNotificationsService,
    NotificationsGateway,
    UserService,
    JwtService,
    MailService,
    QwalletService,
    HttpService,
    TransactionHistoryService,
    CwalletService,
  ],
})
export class QwalletHooksModule {}
