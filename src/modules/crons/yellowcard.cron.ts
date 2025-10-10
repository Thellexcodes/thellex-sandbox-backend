import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { YellowCardService } from '../payments/v1/yellowcard.service';
import { rateCache } from '@/utils/constants';
import { EVERY_15_SECONDS_CRON } from '@/config/settings';

@Injectable()
export class YellowCardCron {
  private readonly logger = new Logger(YellowCardCron.name);

  constructor(private readonly yellowCardService: YellowCardService) {}

  @Cron(EVERY_15_SECONDS_CRON)
  async cacheRates() {
    try {
      const { rates } = await this.yellowCardService.getRates();

      if (rates) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 15 * 1000);

        rateCache.set('y_rates', {
          expiresAt: expiresAt.toISOString(),
          data: rates,
        });

        // this.logger.log(`✅ Cached Yellow Card rates successfully`);
      } else {
        this.logger.warn(`⚠️ Yellow Card rates fetch returned no data`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to fetch Yellow Card rates`, error);
    }
  }
}
