import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { UserService } from '../users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { jwtConfigurations } from '@/v1/config/jwt.config';
import { MailService } from '../email/mail.service';
import { KycEntity } from '@/v1/utils/typeorm/entities/kyc/kyc.entity';
import { kycController } from './kyc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, KycEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(),
      }),
      inject: [],
    }),
  ],
  controllers: [kycController],
  providers: [KycService, UserService, MailService],
})
export class KycModule {}
