import { Module } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { QwalletHooksController } from './qwallet-hooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import { UserService } from '@/modules/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/modules/email/mail.service';
import { QwalletService } from '../../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { CwalletService } from '../../cwallet/cwallet.service';

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
