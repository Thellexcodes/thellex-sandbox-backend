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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthnEntity, DeviceEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({ ...jwtConfigurations(configService) }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthnController],
  providers: [AuthnService, UserService, MailService],
  exports: [AuthnService],
})
export class AuthModule {}
