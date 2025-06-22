import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccountType,
  CircleDeveloperControlledWalletsClient,
  GetTokenInput,
  GetTransactionInput,
  initiateDeveloperControlledWalletsClient,
  Wallet,
  WalletSetResponseData,
} from '@circle-fin/developer-controlled-wallets';
import {
  ICEstimateTransactionFeeDataResponse,
  ICEstimateTransferFee,
  ICGetTransactionResponse,
  ICValidateAddress,
  ICValidateAddressDataResponse,
  ICWalletBalanceResponse,
  ICWalletResponse,
  ICWalletTransactionResponse,
} from '@/models/cwallet.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import { toUTCDate } from '@/utils/helpers';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { CreateCryptoWithdrawPaymentDto } from '@/modules/payments/dto/create-withdraw-crypto.dto';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { getAppConfig } from '@/constants/env';
import { walletConfig } from '@/utils/tokenChains';

@Injectable()
export class CwalletService {
  private circleClient: CircleDeveloperControlledWalletsClient;

  constructor(
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletProfilesRepo: Repository<CwalletProfilesEntity>,
    @InjectRepository(CwalletsEntity)
    private readonly cWalletsRepo: Repository<CwalletsEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {
    this.circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: getAppConfig().CWALLET.API_KEY,
      entitySecret: getAppConfig().CWALLET.ENTITY_SECRET,
    });
  }

  async lookupSubAccount(
    user: UserEntity,
  ): Promise<CwalletProfilesEntity | null> {
    return await this.cWalletProfilesRepo.findOne({
      where: { user: { id: user.id } },
    });
  }

  async lookupSubWallet(address: string): Promise<CwalletsEntity | null | any> {
    // return await this.cWalletsRepo.findOne({
    //   where: { address },
    //   relations: ['profile', 'profile.user'],
    // });
  }

  async fetchPaymentAddress(id) {}

  async lookupSubWalletByID(id: string): Promise<CwalletsEntity | null> {
    return await this.cWalletsRepo.findOne({
      where: { id },
    });
  }

  async createWalletSet(user: UserEntity): Promise<WalletSetResponseData> {
    if (user.cWalletProfile) {
      throw new Error('User already has a wallet profile.');
    }

    try {
      const response = await this.circleClient.createWalletSet({
        name: user.idempotencyKey,
      });
      const walletSet = response.data.walletSet;

      const newProfile = this.cWalletProfilesRepo.create({
        user,
        walletSetId: walletSet.id,
        createdAt: toUTCDate(walletSet.createDate),
        updatedAt: toUTCDate(walletSet.updateDate),
      });

      await this.cWalletProfilesRepo.save(newProfile);
      return response.data;
    } catch (error) {
      console.error('Error creating wallet set:', error);
      throw new Error('Failed to create wallet set');
    }
  }

  async createCryptoWithdrawal(
    dto: CreateCryptoWithdrawPaymentDto,
    wallet: CwalletsEntity,
  ): Promise<TransactionHistoryEntity | any> {
    // try {
    //   const tokenId = getTokenId({
    //     token: dto.assetCode,
    //     isTestnet: !(getEnv() === ENV_PRODUCTION),
    //   });
    //   const paymentNetwork = cWalletNetworkNameGetter(dto.network);
    //   const transfer = await this.createTransaction(
    //     wallet.walletID,
    //     tokenId,
    //     dto.fund_uid,
    //     [`${dto.amount}`],
    //   );
    //   const transaction = await this.getTransaction({
    //     id: transfer.data.id,
    //     txType: PaymentType.OUTBOUND,
    //   });
    //   const txnHistory: TransactionHistoryDto = {
    //     event: WalletWebhookEventEnum.WithdrawPending,
    //     tokenId: transaction.tokenId,
    //     transactionId: transfer.data.id,
    //     type: PaymentType.OUTBOUND,
    //     assetCode: dto.assetCode,
    //     amount: dto.amount,
    //     blockchainTxId: transaction.txHash,
    //     walletId: wallet.walletID,
    //     sourceAddress: wallet.address,
    //     destinationAddress: transaction.destinationAddress,
    //     paymentNetwork,
    //     reason: dto.transaction_note,
    //     feeLevel: FeeLevel.HIGH,
    //     updatedAt: toUTCDate(transaction.updateDate),
    //     createdAt: toUTCDate(transaction.createDate),
    //     walletName: paymentNetwork,
    //     user: wallet.profile.user,
    //     paymentStatus: PaymentStatus.Processing,
    //   };
    //   return await this.transactionHistoryService.create(
    //     txnHistory,
    //     wallet.profile.user,
    //   );
    // } catch (error) {
    //   console.error('Error creating withdrawal transaction:', error);
    //   throw new Error('Failed to process withdrawal');
    // }
  }

  async getUserWallet(id: string): Promise<ICWalletResponse> {
    try {
      return await this.circleClient.getWallet({ id });
    } catch (error) {
      console.error('Failed to fetch user wallet:', error);
      throw error;
    }
  }

  async getWalletTokenBalance(
    walletId: string,
  ): Promise<ICWalletBalanceResponse> {
    try {
      return await this.circleClient.getWalletTokenBalance({ id: walletId });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  }

  async getToken(data: GetTokenInput) {
    return await this.circleClient.getToken(data);
  }

  async createTransaction(
    walletId: string,
    tokenId: string,
    destinationAddress: string,
    amount: string[],
  ): Promise<ICWalletTransactionResponse> {
    try {
      return await this.circleClient.createTransaction({
        walletId,
        tokenId,
        destinationAddress,
        fee: { type: 'level', config: { feeLevel: 'HIGH' } },
        amount,
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  async getTransaction(data: GetTransactionInput): ICGetTransactionResponse {
    try {
      const response = await this.circleClient.getTransaction(data);
      return response.data.transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  async getBalanceByAddress(id: string, token: TokenEnum): Promise<number> {
    const normalizedToken = token.toUpperCase();

    const response = await this.circleClient.getWalletTokenBalance({
      id,
      name: normalizedToken,
    });

    return Number(response.data.tokenBalances[0]?.amount ?? 0);
  }

  async validateAddress(
    data: ICValidateAddress,
  ): ICValidateAddressDataResponse {
    return (await this.circleClient.validateAddress(data)).data;
  }

  async estimateTransferFee(
    data: ICEstimateTransferFee,
  ): ICEstimateTransactionFeeDataResponse {
    return (await this.circleClient.estimateTransferFee(data)).data;
  }

  async ensureUserHasProfileAndWallets(user: UserEntity): Promise<void> {
    let profile = await this.lookupSubAccount(user);
    if (!profile) {
      await this.createWalletSet(user);
      profile = await this.cWalletProfilesRepo.findOne({
        where: { user: { id: user.id } },
      });
    }

    let wallets = await this.cWalletsRepo.find({
      where: { profile: { id: profile.id } },
    });
    if (wallets.length > 0) return;

    const walletTypes = profile.walletTypes;
    const walletProvider = profile.walletProvider;
    const walletSetId = profile.walletSetId;
    const newWallets: CwalletsEntity[] = [];

    for (const walletType of walletTypes) {
      const providerConfig =
        walletConfig[walletType]?.providers[walletProvider];
      if (!providerConfig) continue;

      const networks = Object.keys(
        providerConfig.networks,
      ) as SupportedBlockchainType[];

      for (const network of networks) {
        const tokens = providerConfig.networks[network].tokens;

        for (const token of tokens) {
          const tokenExistsInDb = await this.walletExists(
            profile.id,
            walletType,
            network,
          );
          if (tokenExistsInDb) continue;

          const createdWallet = await this.createAndStoreWallet(
            token,
            network,
            walletType,
            profile,
            walletProvider,
            walletSetId,
          );
          if (createdWallet) {
            newWallets.push(createdWallet);
          }
        }
      }
    }

    const allNewTokens = await Promise.all(
      newWallets.map((wallet) =>
        this.buildTokensForWallet(wallet, wallet.networkMetadata),
      ),
    );

    const tokensToSave = allNewTokens.flat().filter(Boolean);

    if (tokensToSave.length > 0) {
      await this.tokenRepo.save(tokensToSave);
    }
  }

  async updateWalletTokenBalance(
    wallet: CwalletsEntity,
    assetCode: string,
    newBalance: string,
  ): Promise<void> {
    try {
      if (!wallet) throw new Error('Wallet not found');

      //[x] also include network check
      const token = wallet.tokens.find((t) => t.assetCode === assetCode);
      if (!token) throw new Error('Token not found in wallet');

      token.balance = newBalance;

      await this.tokenRepo.save(token);
    } catch (err) {
      console.error('Error updating wallet token balance:', err);
    }
  }

  private async walletExists(
    profileId: string,
    walletType: SupportedWalletTypes,
    network: SupportedBlockchainType,
  ): Promise<boolean> {
    const existingWallet = await this.cWalletsRepo.findOne({
      where: {
        profile: { id: profileId },
        walletType,
      },
    });

    return !!existingWallet?.networkMetadata?.[network];
  }

  private async checkWalletRemote(
    qid: string,
    token: string,
    network: SupportedBlockchainType,
  ): Promise<string | null | any> {
    // try {
    //   const walletDetails = await this.fetchPaymentAddress(qid, token, network);
    //   return walletDetails?.data?.address ?? null;
    // } catch (err) {
    //   console.warn(`Remote wallet check failed for ${qid} on ${network}`, err);
    //   return null;
    // }
  }

  // private async storeRemoteWallet(
  //   address: string,
  //   token: string,
  //   network: SupportedBlockchainType,
  //   walletType: SupportedWalletTypes,
  //   profile: CwalletProfilesEntity,
  //   walletProvider: WalletProviderEnum,
  // ) {
  //   const newWallet = this.cWalletsRepo.create({
  //     address,
  //     walletID: 'remote-import',
  //     custodyType: 'external',
  //     accountType: 'wallet',
  //     walletType,
  //     walletProvider,
  //     profile,
  //     currency: token,
  //     networkMetadata: {
  //       [network]: { address },
  //     },
  //   });

  //   await this.cWalletsRepo.save(newWallet);
  // }

  private async createAndStoreWallet(
    token: string,
    network: SupportedBlockchainType,
    walletType: SupportedWalletTypes,
    profile: CwalletProfilesEntity,
    walletProvider: WalletProviderEnum,
    walletSetId: string,
  ): Promise<CwalletsEntity | null | any> {
    const response = await this.circleClient.createWallets({
      walletSetId,
      blockchains: [network] as any,
      count: 1,
      accountType: 'SCA',
    });

    const wallet = response.data.wallets[0] as Wallet & {
      accountType: string;
      scaCore: string;
    };

    const newWallet = this.cWalletsRepo.create({
      walletID: wallet.id,
      currency: 'USD',
      custodyType: 'custodial',
      accountType: 'wallet',
      walletType,
      walletProvider,
      profile,
      scaCore: wallet.scaCore,
      networkMetadata: {
        [network]: {
          address: wallet.address,
          tokenId: '',
          memo: '',
          destinationTag: '',
        },
      },
    });

    return await this.cWalletsRepo.save(newWallet);
  }

  async buildTokensForWallet(
    wallet: CwalletsEntity,
    networkMetadata: Record<
      SupportedBlockchainType,
      {
        address: string;
        tokenId?: string;
        memo?: string;
        destinationTag?: string;
      }
    >,
  ): Promise<TokenEntity[]> {
    const tokensToSave: TokenEntity[] = [];

    const providerConfig =
      walletConfig[wallet.walletType]?.providers?.[wallet.walletProvider];
    if (!providerConfig) return tokensToSave;

    for (const network of Object.keys(
      networkMetadata,
    ) as SupportedBlockchainType[]) {
      const networkConfig = providerConfig.networks?.[network];
      if (!networkConfig) continue;

      const tokenSymbols = networkConfig.tokens;

      for (const symbol of tokenSymbols) {
        const tokenIdFromConfig = networkConfig.tokenIds?.[symbol];
        const tokenIdFromMetadata = networkMetadata[network]?.tokenId;

        // Check if token already exists for this wallet + network + symbol
        const existing = await this.tokenRepo.findOne({
          where: {
            qwallet: { id: wallet.id },
            network,
            assetCode: symbol,
          },
        });

        if (existing) continue;

        //[x] update issure
        const token = this.tokenRepo.create({
          name: symbol,
          issuer: tokenIdFromMetadata ?? tokenIdFromConfig ?? null,
          walletType: wallet.walletType,
          walletProvider: wallet.walletProvider,
          cwallet: wallet,
          network,
          assetCode: symbol,
          balance: '0',
        });

        tokensToSave.push(token);
      }
    }

    return tokensToSave;
  }
}
