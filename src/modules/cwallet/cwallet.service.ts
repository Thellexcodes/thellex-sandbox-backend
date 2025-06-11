import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Blockchain,
  CircleDeveloperControlledWalletsClient,
  GetWalletInput,
  initiateDeveloperControlledWalletsClient,
  Wallet,
  WalletSet,
  WalletSetResponseData,
} from '@circle-fin/developer-controlled-wallets';
import {
  CwalletBalanceResponse,
  CwalletResponse,
  CwalletTransactionResponse,
} from '@/types/cwallet.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/cwallet/cwallet-profiles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CwalletsEntity,
  ICwallet,
} from '@/utils/typeorm/entities/cwallet/cwallet.entity';
import { ChainTokens, TokenEnum } from '@/config/settings';

@Injectable()
export class CwalletService {
  private circleClient: CircleDeveloperControlledWalletsClient;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletProfilesRepo: Repository<CwalletProfilesEntity>,
    @InjectRepository(CwalletsEntity)
    private readonly cWalletsRepo: Repository<CwalletsEntity>,
  ) {
    this.circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: this.configService.get<string>('CWALLET_API_KEY'),
      entitySecret: this.configService.get<string>('CWALLET_ENTITY_SECRET'),
    });
  }

  async lookupUser(user: UserEntity) {
    return null;
  }

  async createWalletSet(user: UserEntity): Promise<WalletSetResponseData> {
    try {
      const response = await this.circleClient.createWalletSet({
        name: user.idempotencyKey,
      });

      const walletSetRes = response.data.walletSet as WalletSet & {
        name: string;
      };

      if (user.cWalletProfile) {
        //TODO: THROW ERROS with custom error handler
        return response.data;
      }

      // Create new profile if it doesn’t exist
      const newProfile = new CwalletProfilesEntity();
      newProfile.user = user;
      newProfile.displayName = walletSetRes.name;
      newProfile.walletSetId = walletSetRes.id;
      newProfile.createdAt = new Date(walletSetRes.createDate);
      newProfile.updatedAt = new Date(walletSetRes.updateDate);

      await this.cWalletProfilesRepo.save(newProfile);

      return response.data;
    } catch (error) {
      console.log('Failed to create wallet:', error);
      throw error;
    }
  }

  async createWallet(
    walletSetId: string,
    blockchains: Blockchain[],
    user: UserEntity,
  ): Promise<ICwallet> {
    const response = await this.circleClient.createWallets({
      walletSetId,
      blockchains,
      count: 1,
      accountType: 'SCA',
    });

    const walletData = response.data.wallets[0] as Wallet & {
      accountType: string;
      scaCore: string;
    };

    const profile = await this.cWalletProfilesRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (!profile) {
      throw new Error('Wallet profile not found for user.');
    }

    const newWallet = new CwalletsEntity();
    newWallet.walletID = walletData.id;
    newWallet.profile = profile;
    newWallet.address = walletData.address;
    newWallet.defaultNetwork = walletData.blockchain;
    newWallet.custodyType = walletData.custodyType;
    newWallet.blockchain = walletData.blockchain;
    newWallet.accountType = walletData.accountType;
    newWallet.state = walletData.state;
    newWallet.scaCore = walletData.scaCore;
    newWallet.createdAt = new Date(walletData.createDate);
    newWallet.updatedAt = new Date(walletData.updateDate);

    newWallet.reference = null;
    newWallet.currency = 'USD';
    newWallet.totalPayments = null;
    newWallet.balance = null;

    return await this.cWalletsRepo.save(newWallet);
  }

  async getUserWallet(walletId: GetWalletInput): Promise<CwalletResponse> {
    try {
      const response = await this.circleClient.getWallet(walletId);
      return response;
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      throw error;
    }
  }

  async getWalletTokenBalance(
    walletId: string,
  ): Promise<CwalletBalanceResponse> {
    try {
      const response = await this.circleClient.getWalletTokenBalance({
        id: walletId,
      });
      return response;
    } catch (error) {
      console.error('Failed to get wallet token balance:', error);
      throw error;
    }
  }

  async createTransaction(
    walletId: string,
    tokenId: string,
    destinationAddress: string,
    amount: string[],
  ): Promise<CwalletTransactionResponse> {
    try {
      const response = await this.circleClient.createTransaction({
        walletId,
        tokenId,
        destinationAddress,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'HIGH', // Options: LOW, MEDIUM, HIGH
          },
        },
        amount,
      });
      return response;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  supports(network: Blockchain, token: TokenEnum): boolean {
    const tokens = ChainTokens[network];
    return tokens?.includes(token) ?? false;
  }
}
