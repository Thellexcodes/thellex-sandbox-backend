import { Module } from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { QwalletController } from './qwallet.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { HttpService } from '@/middleware/http.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthnEntity, QWalletProfileEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({ ...jwtConfigurations(configService) }),
      inject: [ConfigService],
    }),
  ],
  controllers: [QwalletController],
  providers: [QwalletService, HttpService],
  exports: [QwalletService, HttpService],
})
export class QwalletModule {}
