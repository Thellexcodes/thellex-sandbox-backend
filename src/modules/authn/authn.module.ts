import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { AuthnController } from './authn.controller';
import { AuthnService } from './authn.service';
import { UserService } from '../user/user.service';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { MailService } from '../mail/mail.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet/qwallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthnEntity,
      DeviceEntity,
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
  controllers: [AuthnController],
  providers: [
    AuthnService,
    UserService,
    MailService,
    QwalletService,
    HttpService,
  ],
  exports: [AuthnService],
})
export class AuthModule {}
