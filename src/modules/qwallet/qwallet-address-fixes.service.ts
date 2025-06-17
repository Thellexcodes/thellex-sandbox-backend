import { TokenEnum } from '@/config/settings';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { QWalletsEntity } from '@/utils/typeorm/entities/qwallet/qwallets.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//TODO: FIX LATER
@Injectable()
export class QWalletAddressFixerService {
  private readonly logger = new Logger(QWalletAddressFixerService.name);

  constructor(
    @InjectRepository(QWalletsEntity)
    private readonly qwalletsRepo: Repository<QWalletsEntity>,

    @InjectRepository(QWalletProfileEntity)
    private readonly profileRepo: Repository<QWalletProfileEntity>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async fixNoAddressWallets() {
    console.log('chckeing');

    const walletsWithNoAddress = await this.qwalletsRepo.find({
      where: { address: 'no-address' },
      relations: ['profile'],
    });

    if (!walletsWithNoAddress.length) {
      this.logger.debug('No wallets with "no-address" found.');
      return;
    }

    for (const wallet of walletsWithNoAddress) {
      const qid = wallet.profile?.qid;
      if (!qid) {
        this.logger.warn(`Wallet ${wallet.id} has no associated profile.qid`);
        continue;
      }

      try {
        const walletDetails = await this.fetchPaymentAddress(
          qid,
          TokenEnum.USDT,
        );
        const newAddress = walletDetails?.data?.address;

        if (newAddress && newAddress !== 'no-address') {
          wallet.address = newAddress;
          wallet.defaultNetwork = walletDetails.data.network;
          await this.qwalletsRepo.save(wallet);
          this.logger.log(
            `Updated wallet ${wallet.id} with address ${newAddress}`,
          );
        } else {
          this.logger.warn(
            `Address still not available for wallet ${wallet.id} (qid: ${qid})`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error updating wallet ${wallet.id}:`,
          error.stack || error.message,
        );
      }
    }
  }

  // Make sure this matches the signature and behavior of your existing method
  private async fetchPaymentAddress(
    qid: string,
    token: TokenEnum,
  ): Promise<any> {
    // TODO: Replace this with your actual fetchPaymentAddress logic or import it from your service
    throw new Error('fetchPaymentAddress not implemented');
  }
}
