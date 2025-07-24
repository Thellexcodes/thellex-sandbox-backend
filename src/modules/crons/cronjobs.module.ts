import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { YellowCardCron } from './yellowcard.cron';
import { RampSettlementsCron } from './fiat-crypto/ramp-settlements-cron';

@Module({
  providers: [CronjobsService, YellowCardCron, RampSettlementsCron],
})
export class CronjobsModule {}
