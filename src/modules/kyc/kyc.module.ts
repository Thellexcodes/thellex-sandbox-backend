import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { DkycController } from './kyc.controller';
import { HttpService } from '@/middleware/http.service';
import { UserService } from '../users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { jwtConfigurations } from '@/config/jwt.config';
import { MailService } from '../email/mail.service';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, KycEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({ ...jwtConfigurations(configService) }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DkycController],
  providers: [KycService, HttpService, UserService, MailService, HttpService],
})
export class KycModule {}
