import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseDistributionService } from './firebase-distribution.service';
import { FirebaseCronService } from './firebase-cron.service';
import { FirebaseStoreService } from './firebase-store.service';
import { MailService } from '../email/mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetaTesterEntity } from '@/utils/typeorm/entities/beta.testers.entity';
import { ProcessedBuildEntity } from '@/utils/typeorm/entities/processed-build.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BetaTesterEntity, ProcessedBuildEntity])],
  controllers: [FirebaseController],
  providers: [
    FirebaseService,
    FirebaseCronService,
    FirebaseAuthService,
    FirebaseStoreService,
    FirebaseDistributionService,
    MailService,
  ],
  exports: [
    FirebaseService,
    FirebaseCronService,
    FirebaseAuthService,
    FirebaseStoreService,
    FirebaseDistributionService,
  ],
})
export class FirebaseModule {}
