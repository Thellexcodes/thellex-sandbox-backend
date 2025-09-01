import { Global, Module } from '@nestjs/common';
import { CwalletService } from './cwallet.service';
import { CwalletController } from './cwallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { AuthVerificationCodesEntity } from '@/v1/utils/typeorm/entities/auth-verification-codes.entity';
import { AuthEntity } from '@/v1/utils/typeorm/entities/auth.entity';

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
