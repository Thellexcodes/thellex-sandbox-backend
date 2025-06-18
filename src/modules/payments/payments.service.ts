import { Injectable } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { RequestCryptoPaymentResponse } from '@/types/request.types';
import { SupportedBlockchainType } from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { CreateRequestPaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
  ) {}

  /**
   * Creates a request for a crypto wallet payment from a user.
   *
   * @param {CreateRequestPaymentDto} createRequestPaymentDto - The payment request details (amount, currency, network, etc.).
   * @param {UserEntity} user - The user who is making the request.
   * @returns {Promise<RequestCryptoPaymentResponse>} A promise that resolves to the crypto payment request response.
   */
  async requestCryptoWallet(
    createRequestPaymentDto: CreateRequestPaymentDto,
    user: UserEntity,
  ): Promise<RequestCryptoPaymentResponse> {
    const wallet = await this.qwalletService.findWalletByUserAndNetwork(
      user,
      createRequestPaymentDto.network,
      createRequestPaymentDto.assetCode,
    );

    return { wallet: wallet, assetCode: createRequestPaymentDto.assetCode };
  }

  /**
   * Handles a cryptocurrency withdrawal request.
   * @param {CreateCryptoWithdrawPaymentDto} withdrawCryptoPaymentDto - The withdrawal request details, including amount, currency, and blockchain network.
   * @returns {Promise<TransactionHistoryEntity>} A promise that resolves to the withdrawal handling response.
   */
  async handleWithdrawCryptoPayment(
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
  ): Promise<TransactionHistoryEntity | null> {
    if (
      [SupportedBlockchainType.BEP20, SupportedBlockchainType.TRC20].includes(
        withdrawCryptoPaymentDto.network,
      )
    ) {
      const wallet = await this.qwalletService.lookupSubWallet(
        withdrawCryptoPaymentDto.sourceAddress,
      );

      return await this.qwalletService.createCryptoWithdrawal(
        withdrawCryptoPaymentDto,
        wallet,
      );
    }

    if (
      [SupportedBlockchainType.MATIC].includes(withdrawCryptoPaymentDto.network)
    ) {
      const wallet = await this.cwalletService.lookupSubWallet(
        withdrawCryptoPaymentDto.sourceAddress,
      );

      return await this.cwalletService.createCryptoWithdrawal(
        withdrawCryptoPaymentDto,
        wallet,
      );
    }
  }

  async handleCryptoFeeEstimator() {}
}
