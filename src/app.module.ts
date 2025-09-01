import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './v1/modules/users/user.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { jwtConfigurations } from './v1/config/jwt.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor } from './v1/middleware/error.interceptor';
import { AuthnService } from './v1/modules/auth/auth.service';
import { AuthModule } from './v1/modules/auth/auth.module';
import { UserService } from './v1/modules/users/user.service';
import { UserEntity } from './v1/utils/typeorm/entities/user.entity';
import { DeviceEntity } from './v1/utils/typeorm/entities/device.entity';
import { MailModule } from './v1/modules/email/mail.module';
import { MailService } from './v1/modules/email/mail.service';
import { AuthVerificationCodesEntity } from './v1/utils/typeorm/entities/auth-verification-codes.entity';
import { SwapModule } from './v1/modules/aggregators/swap/swap.module';
import { BridgeModule } from './v1/modules/aggregators/bridge/bridge.module';
import { TokenModule } from './v1/modules/tokens/token.module';
import { LogRequestMiddleware } from './v1/middleware/log-request.middleware';
import { CardManagementModule } from './v1/modules/card-management/card-management.module';
import { StellarModule } from './v1/modules/stellar/stellar.module';
import { KycModule } from './v1/modules/kyc/kyc.module';
import { PaymentsModule } from './v1/modules/payments/payments.module';
import { NotificationsModule } from './v1/modules/notifications/notifications.module';
import { CronjobsModule } from './v1/modules/crons/cronjobs.module';
import { TransactionHistoryModule } from './v1/modules/transaction-history/transaction-history.module';
import { SharedModule } from './v1/modules/shared.module';
import { GeoLocationMiddleware } from './v1/middleware/geo-location.middleware';
import { QwalletModule } from './v1/modules/wallets/qwallet/qwallet.module';
import { CwalletModule } from './v1/modules/wallets/cwallet/cwallet.module';
import { AuthEntity } from './v1/utils/typeorm/entities/auth.entity';
import { WalletManagerModule } from './v1/modules/wallets/manager/wallet-manager.module';
import { typeOrmConfig } from './v1/utils/typeorm/typeOrm.config';
import { ConfigService } from './v1/config/config.service';
import { CrashReportModule } from './v1/crash-report/crash-report.module';
import { BetaTesterEntity } from './v1/utils/typeorm/entities/beta.testers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthEntity,
      DeviceEntity,
      BetaTesterEntity,
      AuthVerificationCodesEntity,
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: async () => await typeOrmConfig(),
      inject: [],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (): Promise<JwtModuleOptions> => ({
        ...jwtConfigurations(),
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    UserModule,
    AuthModule,
    MailModule,
    SwapModule,
    BridgeModule,
    TokenModule,
    CardManagementModule,
    StellarModule,
    QwalletModule,
    KycModule,
    PaymentsModule,
    NotificationsModule,
    CronjobsModule,
    TransactionHistoryModule,
    WalletManagerModule,
    CwalletModule,
    CrashReportModule,
  ],
  controllers: [AppController],
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
    consumer.apply(LogRequestMiddleware, GeoLocationMiddleware).forRoutes('*');
  }
}
