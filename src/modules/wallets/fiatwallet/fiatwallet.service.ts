import { Injectable, Logger } from '@nestjs/common';
import { AbstractFiatwalletService } from './abstracts/abstract.fiatwalletService';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { Repository } from 'typeorm';
import { UserService } from '@/modules/users/user.service';
import { CronTimes } from '@/models/cron.times';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { FiatWalletEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwallet.entity';
import { FiatEnum } from '@/config/settings';

@Injectable()
export class FiatwalletService extends AbstractFiatwalletService {
  private readonly logger = new Logger(FiatwalletService.name);

  constructor(
    @InjectRepository(FiatWalletProfileEntity)
    private readonly profileRepo: Repository<FiatWalletProfileEntity>,

    @InjectRepository(FiatWalletEntity)
    private readonly walletRepo: Repository<FiatWalletEntity>,

    private schedulerRegistry: SchedulerRegistry,

    private userService: UserService,
  ) {
    super();
  }

  getUserFiatWalletProfile(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletByCountry(userId: string, country: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletByTicker(userId: string, ticker: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getAllFiatWallets(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  suspendFiatWallet(walletId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  suspendFiatWallets(walletIds: string[]): Promise<any> {
    throw new Error('Method not implemented.');
  }

  /**
   * Manually start a one-time cron job for creating fiat wallet profile.
   * Once executed, the job stops and is deleted from memory.
   */
  async createProfileWithWallet(
    userId: string,
  ): Promise<FiatWalletProfileEntity> {
    // Create profile
    const profile = new FiatWalletProfileEntity();
    profile.user = { id: userId } as UserEntity;

    //[x] make request to vfd

    // Create wallet for this profile (example: Naria)
    const wallet = new FiatWalletEntity();
    wallet.currency = FiatEnum.NGN;
    wallet.balance = 0;
    wallet.bankName = '';
    wallet.accountName = '';
    wallet.accountNumber = '';

    // Attach wallet to profile
    profile.wallets = [wallet];

    // Save profile and cascade will save wallet as well
    return await this.profileRepo.save(profile);
  }

  async addWalletToProfile(
    profileId: string,
    currency: FiatEnum,
    bankName = '',
    accountName = '',
    accountNumber = '',
  ): Promise<FiatWalletEntity> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
      relations: ['wallets'], // make sure to load existing wallets
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const wallet = new FiatWalletEntity();
    wallet.currency = currency;
    wallet.balance = 0;
    wallet.bankName = bankName;
    wallet.accountName = accountName;
    wallet.accountNumber = accountNumber;
    wallet.profile = profile;

    // Save wallet (profile does not need to be saved again because we set profile)
    return await this.walletRepo.save(wallet);
  }
}
