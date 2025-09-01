import { Module } from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { QwalletController } from './qwallet.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConfigurations } from '@/v1/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { QWalletProfileEntity } from '@/v1/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { HttpService } from '@/v1/middleware/http.service';
import { AuthEntity } from '@/v1/utils/typeorm/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthEntity, QWalletProfileEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(),
      }),
      inject: [],
    }),
  ],
  controllers: [QwalletController],
  providers: [QwalletService, HttpService],
  exports: [QwalletService, HttpService],
})
export class QwalletModule {}
