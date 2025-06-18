import { Global, Module } from '@nestjs/common';
import { CwalletService } from './cwallet.service';
import { CwalletController } from './cwallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/auth.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthnEntity,
      QWalletProfileEntity,
      AuthVerificationCodesEntity,
    ]),
  ],
  controllers: [CwalletController],
  providers: [CwalletService],
  exports: [CwalletService],
})
export class CwalletModule {}
