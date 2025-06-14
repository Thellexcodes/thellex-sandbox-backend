import { Injectable } from '@nestjs/common';
import { CreateRequestPaymentDto } from '../qwallet/dto/create-request.dto';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { RequestCryptoPaymentResponse } from '@/types/request.types';
import { CwalletService } from '../cwallet/cwallet.service';
import { SupportedBlockchainType } from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
  ) {}

  async requestCryptoWallet(
    createRequestPaymentDto: CreateRequestPaymentDto,
    user: UserEntity,
  ): Promise<RequestCryptoPaymentResponse> {
    // Check if wallet already exists for the user and blockchain/network
    const wallet = await this.qwalletService.findWalletByUserAndNetwork(
      user,
      createRequestPaymentDto.network,
      createRequestPaymentDto.assetCode,
    );

    return { wallet: wallet, assetCode: createRequestPaymentDto.assetCode };
  }

  async handleWithdrawCryptoPayment(
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
  ) {
    if (
      [SupportedBlockchainType.BEP20, SupportedBlockchainType.TRC20].includes(
        withdrawCryptoPaymentDto.network,
      )
    ) {
      // const az = this.qwalletService.createCryptoWithdrawal(
      //   withdrawCryptoPaymentDto,
      // );
    }

    const wallet = await this.cwalletService.lookupSubWallet(
      withdrawCryptoPaymentDto.sendAddress,
    );

    console.log(wallet);

    return await this.cwalletService.createCryptoWithdrawal(
      withdrawCryptoPaymentDto,
      wallet,
    );
  }

  async handleCryptoFeeEstimator() {}
}
