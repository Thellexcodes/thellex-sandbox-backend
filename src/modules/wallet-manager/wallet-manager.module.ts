import { Module } from '@nestjs/common';
import { WalletManagerService } from './wallet-manager.service';
import { WalletManagerController } from './wallet-manager.controller';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet.entity';
import { UserService } from '../user/user.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      QwalletEntity,
      TransactionHistoryEntity,
      AuthVerificationCodesEntity,
    ]),
  ],
  controllers: [WalletManagerController],
  providers: [
    HttpService,
    UserService,
    JwtService,
    MailService,
    QwalletService,
    WalletManagerService,
    TransactionHistoryService,
  ],
})
export class WalletManagerModule {}
