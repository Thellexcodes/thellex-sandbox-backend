import { Injectable } from '@nestjs/common';
import { CreateRequestPaymentDto } from '../qwallet/dto/create-request.dto';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { HandleWithdrawPaymentResponse } from '@/types/qwallet.types';
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
    user: UserEntity,
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
  ): Promise<HandleWithdrawPaymentResponse | any> {
    // Use qwallet for BEP20 or TRC20
    if (
      withdrawCryptoPaymentDto.network === SupportedBlockchainType.BEP20 ||
      withdrawCryptoPaymentDto.network === SupportedBlockchainType.TRC20
    ) {
      return this.qwalletService.createCryptoWithdrawal(
        user.qWalletProfile.id,
        withdrawCryptoPaymentDto,
      );
    }

    // Use cwallet for others (e.g., MATIC)
    return this.cwalletService.createCryptoWithdrawal(withdrawCryptoPaymentDto);
  }
}
