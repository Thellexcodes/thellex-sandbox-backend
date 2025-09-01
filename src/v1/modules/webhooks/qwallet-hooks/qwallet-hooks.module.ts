import { Module } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { QwalletHooksController } from './qwallet-hooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/v1/utils/typeorm/entities/notification.entity';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { UserService } from '@/v1/modules/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/v1/modules/email/mail.service';
import { HttpService } from '@/v1/middleware/http.service';
import { TransactionHistoryService } from '@/v1/modules/transaction-history/transaction-history.service';
import { QwalletService } from '@/v1/modules/wallets/qwallet/qwallet.service';
import { CwalletService } from '@/v1/modules/wallets/cwallet/cwallet.service';
import { TransactionHistoryEntity } from '@/v1/utils/typeorm/entities/transactions/transaction-history.entity';

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
