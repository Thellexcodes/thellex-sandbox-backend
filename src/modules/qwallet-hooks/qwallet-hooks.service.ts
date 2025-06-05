import { Injectable } from '@nestjs/common';
import { CreateQwalletHookDto } from './dto/create-qwallet-hook.dto';
import { UpdateQwalletHookDto } from './dto/update-qwallet-hook.dto';
import { QWalletDepositSuccessfulPayloadDto } from './dto/qwallet-hook-depositSuccessful.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

@Injectable()
export class QwalletHooksService {
  constructor() {}

  handleWalletUpdated(payload: any) {
    return { message: 'Wallet updated event received', payload };
  }

  handleWalletAddressGenerated(payload: any) {
    return { message: 'Wallet address generated', payload };
  }

  handleDepositConfirmation(payload: any) {
    return { message: 'Deposit confirmation received', payload };
  }

  async handleDepositSuccessful(
    payload: QWalletDepositSuccessfulPayloadDto,
    user: UserEntity,
  ) {
    //[x] validate user
    //[x] create notifiaciton
    //[x] alert on websocket
  }

  handleDepositOnHold(payload: any) {
    return { message: 'Deposit on hold', payload };
  }

  handleDepositFailedAml(payload: any) {
    return { message: 'Deposit failed AML check', payload };
  }

  handleDepositRejected(payload: any) {
    return { message: 'Deposit rejected', payload };
  }

  handleWithdrawSuccessful(payload: any) {
    return { message: 'Withdraw successful', payload };
  }

  handleWithdrawRejected(payload: any) {
    return { message: 'Withdraw rejected', payload };
  }

  handleOrderDone(payload: any) {
    return { message: 'Order completed', payload };
  }

  handleOrderCancelled(payload: any) {
    return { message: 'Order cancelled', payload };
  }

  handleSwapCompleted(payload: any) {
    return { message: 'Swap completed', payload };
  }

  handleSwapReversed(payload: any) {
    return { message: 'Swap reversed', payload };
  }

  handleSwapFailed(payload: any) {
    return { message: 'Swap failed', payload };
  }
}
