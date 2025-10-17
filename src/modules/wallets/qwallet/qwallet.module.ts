import { Module } from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { QwalletController } from './qwallet.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { HttpService } from '@/middleware/http.service';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';

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
