import { Module } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { QwalletHooksController } from './qwallet-hooks.controller';
import { RampHooksService } from './qwallet-ramp-hooks.service';
import { QwalletNotificationsService } from '../notifications/qwallet-notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      UserEntity,
      AuthVerificationCodesEntity,
      QwalletEntity,
      TransactionHistoryEntity,
    ]),
  ],
  controllers: [QwalletHooksController],
  providers: [
    QwalletHooksService,
    RampHooksService,
    QwalletNotificationsService,
    NotificationsGateway,
    UserService,
    JwtService,
    MailService,
    QwalletService,
    HttpService,
    TransactionHistoryService,
  ],
})
export class QwalletHooksModule {}
