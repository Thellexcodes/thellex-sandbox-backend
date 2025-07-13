import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { YellowCardService } from '../payments/yellowcard.service';
import { rateCache } from '@/utils/constants';
import { EVERY_15_SECONDS_CRON } from '@/config/settings';
import { v4 as uuidV4 } from 'uuid';

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

  // @Cron(CronExpression.EVERY_10_SECONDS)
  // async handleSettlement(): Promise<void> {
  //   try {
  //     const accountInfo = await this.yellowCardService.getAccount();
  //     // console.log(accountInfo);

  //     const payload = {
  //       amount: 100000,
  //       walletAddress: '0xRecipientWalletAddress',
  //       cryptoCurrency: 'USDC',
  //       cryptoNetwork: 'ETH',
  //       sequenceId: uuidV4(),
  //       travelRuleInfo: {
  //         name: 'My Business Name',
  //         businessRegistrationNumber: '1234567890',
  //       },
  //     };

  //     // const { data } =
  //     //   await this.yellowCardService.submitSettlementRequest(payload);

  //     //   this.logger.log(`✅ Settlement submitted: ${JSON.stringify(data)}`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
}
