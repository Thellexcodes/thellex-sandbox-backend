import { Module } from '@nestjs/common';
import { DkycService } from './dkyc.service';
import { DkycController } from './dkyc.controller';
import { HttpService } from '@/middleware/http.service';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { jwtConfigurations } from '@/config/jwt.config';
import { MailService } from '../mail/mail.service';
import { DKycEntity } from '@/utils/typeorm/entities/dkyc.entity';
import { QwalletService } from '../qwallet/qwallet.service';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet/qwallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DKycEntity,
      QwalletEntity,
      AuthVerificationCodesEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({ ...jwtConfigurations(configService) }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DkycController],
  providers: [
    DkycService,
    HttpService,
    UserService,
    MailService,
    QwalletService,
    HttpService,
  ],
})
export class DkycModule {}
