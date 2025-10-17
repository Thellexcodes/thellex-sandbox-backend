import { Global, Module } from '@nestjs/common';
import { CwalletService } from './cwallet.service';
import { CwalletController } from './cwallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthEntity,
      QWalletProfileEntity,
      AuthVerificationCodesEntity,
    ]),
  ],
  controllers: [CwalletController],
  providers: [CwalletService],
  exports: [CwalletService],
})
export class CwalletModule {}
