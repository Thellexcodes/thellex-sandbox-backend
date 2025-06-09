import { Injectable } from '@nestjs/common';
import { CreateRequestPaymentDto } from '../qwallet/dto/create-request.dto';
import { QwalletService } from '../qwallet/qwalletProfile.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { HandleWithdrawPaymentResponse } from '@/types/qwallet.types';
import { RequestCryptoPaymentResponse } from '@/types/request.types';
import { CreateWithdrawPaymentDto } from './dto/create-withdrawal.dto';

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
    withdrawPaymentDto: CreateWithdrawPaymentDto,
  ): Promise<HandleWithdrawPaymentResponse> {
    const withdrawResponse = await this.qwalletService.createWithdrawal(
      user.qprofile.id,
      withdrawPaymentDto,
    );
    return withdrawResponse;
  }
}
