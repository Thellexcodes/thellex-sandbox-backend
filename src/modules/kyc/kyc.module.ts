import { Module } from '@nestjs/common';
import { KycService } from './v1/kyc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from '../email/mail.service';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';
import { kycController } from './v1/kyc.controller';
import { GlobalJwtModule } from '../jwt/jwt.module';
import { VfdService } from '../payments/v2/vfd.service';
import { KycServiceV2 } from './v2/v2.kyc.service';
import { UserService } from '../users/v1/user.service';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, KycEntity]), GlobalJwtModule],
  controllers: [kycController],
  providers: [KycService, KycServiceV2, UserService, MailService, VfdService],
})
export class KycModule {}
