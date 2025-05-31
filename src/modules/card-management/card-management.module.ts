import { Module } from '@nestjs/common';
import { CardManagementService } from './card-management.service';
import { CardManagementController } from './card-management.controller';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/authVerificationCodes.entities';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { MailService } from '../mail/mail.service';
import { StellarService } from '../stellar/stellar.service';
import { CardManagementEntity } from '../../utils/typeorm/entities/card-management.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthnEntity,
      AuthVerificationCodesEntity,
      CardManagementEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({ ...jwtConfigurations(configService) }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CardManagementController],
  providers: [CardManagementService, UserService, MailService, StellarService],
})
export class CardManagementModule {}
