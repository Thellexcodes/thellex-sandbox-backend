import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/users/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorInterceptor } from './middleware/error.interceptor';
import { AuthnService } from './modules/auth/v2/auth.service';
import { AuthModule } from './modules/auth/auth.module';
import { DeviceEntity } from './utils/typeorm/entities/device.entity';
import { MailModule } from './modules/email/mail.module';
import { MailService } from './modules/email/mail.service';
import { AuthVerificationCodesEntity } from './utils/typeorm/entities/auth-verification-codes.entity';
import { SwapModule } from './modules/aggregators/swap/swap.module';
import { BridgeModule } from './modules/aggregators/bridge/bridge.module';
import { TokenModule } from './modules/tokens/token.module';
import { LogRequestMiddleware } from './middleware/log-request.middleware';
import { CardManagementModule } from './modules/card-management/card-management.module';
import { StellarModule } from './modules/stellar/stellar.module';
import { KycModule } from './modules/kyc/kyc.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CronjobsModule } from './modules/crons/cronjobs.module';
import { TransactionHistoryModule } from './modules/transaction-history/transaction-history.module';
import { SharedModule } from './modules/shared.module';
import { GeoLocationMiddleware } from './middleware/geo-location.middleware';
import { QwalletModule } from './modules/wallets/qwallet/qwallet.module';
import { CwalletModule } from './modules/wallets/cwallet/cwallet.module';
import { AuthEntity } from './utils/typeorm/entities/auth.entity';
import { CrashReportModule } from './crash-report/crash-report.module';
import { BetaTesterEntity } from './utils/typeorm/entities/beta.testers.entity';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ProcessedBuildEntity } from './utils/typeorm/entities/processed-build.entity';
import { GlobalJwtModule } from './modules/jwt/jwt.module';
import { WalletManagerModule } from './modules/wallets/manager/wallet-manager.module';
import { UserEntity } from './utils/typeorm/entities/user/user.entity';

@Module({
  imports: [
    GlobalJwtModule,
    TypeOrmModule.forFeature([
      UserEntity,
      AuthEntity,
      DeviceEntity,
      BetaTesterEntity,
      ProcessedBuildEntity,
      AuthVerificationCodesEntity,
    ]),
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
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthnService,
    MailService,
    { provide: APP_INTERCEPTOR, useClass: ErrorInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogRequestMiddleware, GeoLocationMiddleware).forRoutes('*');
  }
}
