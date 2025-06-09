import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './config/typeOrm.config';
import { UserModule } from './modules/user/user.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { jwtConfigurations } from './config/jwt.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor } from './middleware/error.interceptor';
import { AuthnController } from './modules/authn/authn.controller';
import { AuthnService } from './modules/authn/authn.service';
import { AuthModule } from './modules/authn/authn.module';
import { UserService } from './modules/user/user.service';
import { UserEntity } from './utils/typeorm/entities/user.entity';
import { AuthnEntity } from './utils/typeorm/entities/authn.entity';
import { DeviceEntity } from './utils/typeorm/entities/device.entity';
import { MailModule } from './modules/mail/mail.module';
import { MailService } from './modules/mail/mail.service';
import { AuthVerificationCodesEntity } from './utils/typeorm/entities/authVerificationCodes.entities';
import { SwapModule } from './modules/aggregators/swap/swap.module';
import { BridgeModule } from './modules/aggregators/bridge/bridge.module';
import { TokenModule } from './modules/token/token.module';
import { LogRequestMiddleware } from './middleware/log-request.middleware';
import { CardManagementModule } from './modules/card-management/card-management.module';
import { StellarModule } from './modules/stellar/stellar.module';
import { QwalletModule } from './modules/qwallet/qwallet.module';
import { DkycModule } from './modules/dkyc/dkyc.module';
import { QwalletEntity } from './utils/typeorm/entities/qwallet/qwallet.entity';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CronjobsModule } from './modules/cronjobs/cronjobs.module';
import { QwalletHooksModule } from './modules/qwallet-hooks/qwallet-hooks.module';
import { TransactionHistoryModule } from './modules/transaction-history/transaction-history.module';
import { WalletManagerModule } from './modules/wallet-manager/wallet-manager.module';
import { GeoWalletMiddleware } from './middleware/geo-wallet.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthnEntity,
      QwalletEntity,
      DeviceEntity,
      AuthVerificationCodesEntity,
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) =>
        await typeOrmConfig(configService),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(configService),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    MailModule,
    SwapModule,
    BridgeModule,
    TokenModule,
    CardManagementModule,
    StellarModule,
    QwalletModule,
    DkycModule,
    PaymentsModule,
    NotificationsModule,
    CronjobsModule,
    QwalletHooksModule,
    TransactionHistoryModule,
    WalletManagerModule,
  ],
  controllers: [AppController, AuthnController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ErrorInterceptor },
    AuthnService,
    UserService,
    MailService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogRequestMiddleware, GeoWalletMiddleware).forRoutes('*');
  }
}
