import { EVERY_15_SECONDS_CRON } from '@/config/settings';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MapleradService } from '../payments/v1/maplerad.service';

@Injectable()
export class MapleradCron {
  private readonly logger = new Logger(MapleradCron.name);

  constructor(private readonly mapleradService: MapleradService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async getAllBankingInstitutions() {
    try {
      this.logger.log('🔄 Fetching all Maplerad banking institutions...');
      const allInstitutions = await this.mapleradService.getAllInstitutions();
      console.log({ allInstitutions });
      this.logger.log('✅ Successfully fetched banking institutions');
    } catch (error) {
      this.logger.error(
        '❌ Failed to fetch Maplerad banking institutions',
        error.stack || error,
      );
    }
  }
}
