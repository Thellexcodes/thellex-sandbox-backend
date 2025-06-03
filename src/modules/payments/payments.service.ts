import { Injectable } from '@nestjs/common';
import { CreateRequestPaymentDto } from '../qwallet/dto/create-request.dto';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  GetUserWalletResponse,
  HandleWithdrawPaymentResponse,
} from '@/types/qwallet.types';
import { WithdrawPaymentDto } from './dto/create-withdrawal.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly qwalletService: QwalletService) {}

  async requestCryptoWallet(
    createRequestPaymentDto: CreateRequestPaymentDto,
    user: UserEntity,
  ): Promise<GetUserWalletResponse> {
    const userWalletResponse = await this.qwalletService.getUserWallet(
      user.qwallet.id,
      createRequestPaymentDto.assetCode,
    );

    return userWalletResponse;
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
