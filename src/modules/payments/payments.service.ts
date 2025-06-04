import { Injectable } from '@nestjs/common';
import { CreateRequestPaymentDto } from '../qwallet/dto/create-request.dto';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { HandleWithdrawPaymentResponse, QWallet } from '@/types/qwallet.types';
import { WithdrawPaymentDto } from './dto/create-withdrawal.dto';
import { RequestCryptoPaymentResponse } from '@/types/request.types';

@Injectable()
export class PaymentsService {
  constructor(private readonly qwalletService: QwalletService) {}

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

  async handleWithdrawPayment(
    user: UserEntity,
    withdrawPaymentDto: WithdrawPaymentDto,
  ): Promise<HandleWithdrawPaymentResponse> {
    const withdrawResponse = await this.qwalletService.createWithdrawal(
      user.qwallet.id,
      withdrawPaymentDto,
    );

    return withdrawResponse;
  }
}
