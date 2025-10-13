import { Module } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { FiatwalletController } from './fiatwallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { UserService } from '@/modules/users/user.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { MailService } from '@/modules/email/mail.service';
import { FiatWalletEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwallet.entity';
import { VfdService } from '@/modules/payments/v2/vfd.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiatWalletProfileEntity,
      FiatWalletEntity,
      UserEntity,
    ]),
  ],
  controllers: [FiatwalletController],
  providers: [FiatwalletService, UserService, MailService, VfdService],
  exports: [FiatwalletService],
})
export class FiatwalletModule {}
