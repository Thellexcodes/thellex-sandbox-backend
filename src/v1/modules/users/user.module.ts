import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/v1/config/jwt.config';
import { MailService } from '../email/mail.service';
import { HttpService } from '@/v1/middleware/http.service';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(),
      }),
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
