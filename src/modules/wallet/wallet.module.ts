import { Module } from '@nestjs/common';
import { QwalletService } from './wallet.service';
import { QwalletController } from './wallet.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigurations } from '@/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet/qwallet.entity';
import { HttpService } from '@/middleware/http.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthnEntity, QwalletEntity]),
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
