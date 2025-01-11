import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { MailService } from '../mail/mail.service';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthnEntity,
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
  controllers: [UserController],
  providers: [UserService, MailService],
})
export class UserModule {}
