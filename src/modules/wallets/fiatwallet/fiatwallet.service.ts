import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AbstractFiatwalletService } from './abstracts/abstract.fiatwalletService';
import { InjectRepository } from '@nestjs/typeorm';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { FiatWalletEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwallet.entity';
import { FiatEnum } from '@/config/settings';
import { VfdService } from '@/modules/payments/v2/vfd.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { DynamicRepositoryService } from '@/utils/DynamicSource';
import { BankProvidersEnum } from '@/models/banks.types';

@Injectable()
export class FiatwalletService extends AbstractFiatwalletService {
  private readonly logger = new Logger(FiatwalletService.name);

  constructor(
    @InjectRepository(FiatWalletProfileEntity)
    private readonly walletProfileRepo: Repository<FiatWalletProfileEntity>,

    @InjectRepository(FiatWalletEntity)
    private readonly walletRepo: Repository<FiatWalletEntity>,

    private readonly vfdService: VfdService,
    private readonly dynamicRepositoryService: DynamicRepositoryService,
  ) {
    super();
  }

  async getUserFiatWalletProfile(
    userId: string,
  ): Promise<FiatWalletProfileEntity | null> {
    return await this.dynamicRepositoryService.findOne<FiatWalletProfileEntity>(
      { relations: 'wallets', id: userId },
      FiatWalletProfileEntity,
    );
  }

  async getUserFiatWalletByCountry(
    userId: string,
    country: string,
  ): Promise<FiatWalletEntity | null> {
    return await this.dynamicRepositoryService.findOne<FiatWalletEntity>(
      { relations: 'profile', userId, country },
      FiatWalletEntity,
    );
  }

  async getUserFiatWalletByTicker(
    userId: string,
    ticker: string,
  ): Promise<FiatWalletEntity | null> {
    return await this.dynamicRepositoryService.findOne<FiatWalletEntity>(
      { relations: 'profile', userId, ticker },
      FiatWalletEntity,
    );
  }

  async getAllFiatWallets(): Promise<FiatWalletEntity[]> {
    const result =
      await this.dynamicRepositoryService.findMany<FiatWalletEntity>(
        { relations: 'profile' },
        FiatWalletEntity,
      );

    return Array.isArray(result) ? result : result.data;
  }

  async suspendFiatWallet(walletId: string): Promise<any> {
    const wallet = await this.walletRepo.findOne({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');

    // wallet.suspended = true;
    return this.walletRepo.save(wallet);
  }

  async suspendFiatWallets(walletIds: string[]): Promise<any[]> {
    const wallets = await this.walletRepo.findByIds(walletIds);
    // wallets.forEach((wallet) => (wallet.suspended = true));
    return this.walletRepo.save(wallets);
  }

  /**
   * Create fiat wallet profile for a user.
   */
  async createProfileWithWallet(userId: string): Promise<void> {
    const existingProfile =
      await this.dynamicRepositoryService.findOne<FiatWalletProfileEntity>(
        { 'user.id': userId, fields: 'id' },
        FiatWalletProfileEntity,
      );

    if (existingProfile)
      throw new CustomHttpException('Profile exists', HttpStatus.CONFLICT);

    const profile = new FiatWalletProfileEntity();
    profile.user = { id: userId } as UserEntity;
    profile.wallets = [];
    await this.walletProfileRepo.save(profile);
  }

  /**
   * Add a new wallet to an existing fiat wallet profile.
   */
  async addWalletToProfileWithBvn(
    userId: string,
    bvn: string,
    dob: string,
  ): Promise<void> {
    try {
      const profile =
        await this.dynamicRepositoryService.findOne<FiatWalletProfileEntity>(
          { 'user.id': userId, fields: 'id' },
          FiatWalletProfileEntity,
        );

      if (!profile)
        throw new CustomHttpException(
          'Profile not found',
          HttpStatus.NOT_FOUND,
        );

      // Fetch all sub-accounts
      const subAccounts = await this.vfdService.getSubAccounts(
        'individual',
        0,
        20000,
      );

      // Check if the BVN already exists
      const existingAccount = subAccounts.find(
        (acc) => acc.bvn.replace('TX-', '') === bvn || acc.bvn === bvn,
      );

      let fiatWallet: CreateIndividualClientResponseDataDto;

      if (existingAccount) {
        fiatWallet = existingAccount;
      } else {
        fiatWallet = await this.vfdService.createIndividualClientWithBvn({
          bvn,
          dob,
        });
      }

      // Prevent duplicate wallet creation for same profile/account number
      const existingWallet = await this.walletRepo.findOne({
        where: {
          profile: { id: profile.id },
          accountNumber: fiatWallet.accountNo,
        },
      });

      if (existingWallet) {
        return;
      }

      // Save new wallet
      const wallet = new FiatWalletEntity();
      wallet.currency = FiatEnum.NGN;
      wallet.bankName = BankProvidersEnum.VFD;
      wallet.firstName = fiatWallet.firstName;
      wallet.middleName = fiatWallet?.middleName;
      wallet.lastName = fiatWallet.lastName;
      wallet.accountNumber = fiatWallet.accountNo;
      wallet.profile = profile;

      await this.walletRepo.save(wallet);
    } catch (err) {
      this.logger.log('❌ Error adding wallet:', err);
    }
  }
}
