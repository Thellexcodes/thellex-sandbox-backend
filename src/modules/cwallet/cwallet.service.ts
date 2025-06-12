import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Blockchain,
  CircleDeveloperControlledWalletsClient,
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
import {
  ChainTokens,
  SupportedBlockchainType,
  tokenAddresses,
  TokenEnum,
} from '@/config/settings';
import { Web3Service } from '@/utils/services/web3.service';

@Injectable()
export class CwalletService {
  private circleClient: CircleDeveloperControlledWalletsClient;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletProfilesRepo: Repository<CwalletProfilesEntity>,
    @InjectRepository(CwalletsEntity)
    private readonly cWalletsRepo: Repository<CwalletsEntity>,
    private readonly web3Service: Web3Service,
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
    blockchains: SupportedBlockchainType[],
    user: UserEntity,
  ): Promise<ICwallet> {
    const normalizedBlockchains = this.normalizeBlockchains(blockchains);
    const response = await this.circleClient.createWallets({
      walletSetId,
      blockchains: normalizedBlockchains,
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

  async getUserWallet(id: string): Promise<CwalletResponse> {
    try {
      const response = await this.circleClient.getWallet({ id });
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
            feeLevel: 'HIGH',
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

  async getBalanceByAddress(
    id: string,
    token: TokenEnum,
    network: SupportedBlockchainType,
  ): Promise<{ assetCode: TokenEnum; balance: number } | any> {
    if (!this.supports(network, token)) {
      throw new Error(`Token ${token} not supported on ${network}`);
    }
    const tokenAddress = tokenAddresses[token][network];
    const normalizedTokenName = token.toUpperCase();
    const response = await this.circleClient
      .getWalletTokenBalance({
        id,
        name: normalizedTokenName,
      })
      .then((d) => d.data);

    return 20;
  }

  supports(network: SupportedBlockchainType, token: TokenEnum): boolean {
    const tokens = ChainTokens[network];
    return tokens?.includes(token) ?? false;
  }

  normalizeBlockchains(blockchains: SupportedBlockchainType[]): Blockchain[] {
    return blockchains.map((bc) => {
      switch (bc.toLowerCase()) {
        case 'matic':
          return Blockchain.Matic;
        default:
          throw new Error(`Unsupported blockchain type: ${bc}`);
      }
    });
  }
}
