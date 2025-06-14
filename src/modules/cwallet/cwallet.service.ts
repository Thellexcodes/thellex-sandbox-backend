import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CircleDeveloperControlledWalletsClient,
  GetTransactionInput,
  initiateDeveloperControlledWalletsClient,
  Wallet,
  WalletSet,
  WalletSetResponseData,
} from '@circle-fin/developer-controlled-wallets';
import {
  CwalletBalanceResponse,
  CwalletResponse,
  CwalletTransactionResponse,
  EstimateTransactionFeeDataResponse,
  GetTransactionResponse,
  IEstimateTransferFee,
  IValidateAddress,
  ValidateAddressDataResponse,
} from '@/types/cwallet.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/cwallet/cwallet-profiles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CwalletsEntity,
  ICwallet,
} from '@/utils/typeorm/entities/cwallet/cwallet.entity';
import { SupportedBlockchainType, TokenEnum } from '@/config/settings';
import {
  cWalletNetworkNameGetter,
  getSupportedNetwork,
  getTokenId,
  normalizeBlockchains,
} from '@/utils/helpers';
import { CreateCryptoWithdrawPaymentDto } from '../payments/dto/create-withdraw-crypto.dto';
import { ENV_TESTNET } from '@/constants/env';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { PaymentStatus, PaymentType } from '@/types/payment.types';
import {
  ITransactionHistory,
  TransactionHistoryDto,
} from '../transaction-history/dto/create-transaction-history.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';

//TODO: Properly handle errors with enum
@Injectable()
export class CwalletService {
  private circleClient: CircleDeveloperControlledWalletsClient;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletProfilesRepo: Repository<CwalletProfilesEntity>,
    @InjectRepository(CwalletsEntity)
    private readonly cWalletsRepo: Repository<CwalletsEntity>,
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletsProfileRepo: Repository<CwalletsEntity>,
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {
    this.circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: this.configService.get<string>('CWALLET_API_KEY'),
      entitySecret: this.configService.get<string>('CWALLET_ENTITY_SECRET'),
    });
  }

  async lookupSubAccount(
    user: UserEntity,
  ): Promise<CwalletProfilesEntity | null> {
    const localSubaccount = await this.cWalletProfilesRepo.findOne({
      where: { user },
    });

    if (localSubaccount) return localSubaccount;
    return null;
  }

  async lookupSubWallet(address: string): Promise<CwalletsEntity | null> {
    const localSubWallet = await this.cWalletsRepo.findOne({
      where: { address },
      relations: ['profile', 'profile.user'],
    });

    if (localSubWallet) return localSubWallet;

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
    const nBlockchains = normalizeBlockchains(blockchains);

    const response = await this.circleClient.createWallets({
      walletSetId,
      blockchains: nBlockchains,
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

  async createCryptoWithdrawal(
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
    wallet: CwalletsEntity,
  ): Promise<TransactionHistoryEntity> {
    try {
      const tokenId = getTokenId({
        token: withdrawCryptoPaymentDto.currency,
        isTestnet: this.configService.get('NODE_ENV') === ENV_TESTNET,
      });

      const paymentNetwork = cWalletNetworkNameGetter(
        withdrawCryptoPaymentDto.network,
      );

      // const transferTransaction = await this.createTransaction(
      //   wallet.walletID,
      //   tokenId,
      //   withdrawCryptoPaymentDto.fund_uid,
      //   [`${withdrawCryptoPaymentDto.amount}`],
      // );

      const transferTransaction = {
        data: {
          id: 'dfb9045a-1101-5fe7-b569-3a0ad1457311',
          state: 'INITIATED',
        },
      };

      const transaction = await this.getTransaction({
        id: transferTransaction.data.id,
        txType: PaymentType.OUTBOUND,
      });

      const txnHistory: ITransactionHistory = {
        tokenId: transaction.tokenId,
        event: WalletWebhookEventType.WithdrawPending,
        transactionId: transferTransaction.data.id,
        type: PaymentType.OUTBOUND,
        currency: withdrawCryptoPaymentDto.currency,
        amount: withdrawCryptoPaymentDto.amount,
        fee: transaction.networkFee,
        blockchainTxId: transaction.txHash,
        walletId: wallet.walletID,
        paymentStatus: PaymentStatus.Processing,
        sourceAddress: wallet.address,
        destinationAddress: transaction.destinationAddress,
        paymentNetwork,
        reason: withdrawCryptoPaymentDto.transaction_note,
        updatedAt: new Date(transaction.updateDate),
        feeLevel: 'HIGH',
        createdAt: new Date(transaction.createDate),
        walletName: paymentNetwork,
        user: wallet.profile.user,
      };

      const txn = await this.transactionHistoryService.create(
        txnHistory,
        wallet.profile.user,
      );

      return txn;
    } catch (error) {
      console.error('Error creating crypto withdrawal:', error);
      throw new Error('Failed to create crypto withdrawal');
    }
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
        fee: { type: 'level', config: { feeLevel: 'HIGH' } },
        amount,
      });
      return response;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  async getTransaction(data: GetTransactionInput): GetTransactionResponse {
    const response = await this.circleClient.getTransaction(data);
    return response.data.transaction;
  }

  async getBalanceByAddress(
    id: string,
    token: TokenEnum,
    network: SupportedBlockchainType,
  ): Promise<number> {
    if (!getSupportedNetwork(network, token)) {
      throw new Error(`Token ${token} not supported on ${network}`);
    }
    const normalizedTokenName = token.toUpperCase();

    const response = await this.circleClient
      .getWalletTokenBalance({
        id,
        name: normalizedTokenName,
      })
      .then((d) => d.data);

    return Number(response.tokenBalances[0].amount || 20);
  }

  async validateAddress(data: IValidateAddress): ValidateAddressDataResponse {
    const response = await this.circleClient.validateAddress(data);
    return response.data;
  }

  async estimateTransferFee(
    data: IEstimateTransferFee,
  ): EstimateTransactionFeeDataResponse {
    const response = await this.circleClient.estimateTransferFee(data);
    return response.data;
  }
}
