import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { MailService } from '../mail/mail.service';
import { QwalletService } from '../qwallet/qwallet.service';
import { HttpService } from '@/middleware/http.service';
import { CwalletService } from '../cwallet/cwallet.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({ ...jwtConfigurations(configService) }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    MailService,
    QwalletService,
    HttpService,
    CwalletService,
  ],
  exports: [UserService],
})
export class UserModule {}
