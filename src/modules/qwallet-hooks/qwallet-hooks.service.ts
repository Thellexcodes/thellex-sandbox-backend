import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateQwalletHookDto } from './dto/create-qwallet-hook.dto';
import { UpdateQwalletHookDto } from './dto/update-qwallet-hook.dto';
import { QWalletDepositSuccessfulPayloadDto } from './dto/qwallet-hook-depositSuccessful.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';
import { QwalletNotificationsService } from '../notifications/qwallet-notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class QwalletHooksService {
  constructor(
    private readonly qwalletNotificationService: QwalletNotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

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
    try {
      const payloadUser = payload.data.user;
      const qwallet = user.qwallet;

      if (payloadUser.id != qwallet.qid) {
        throw new CustomHttpException(
          QWalletWebhookEnum.INVALID_USER,
          HttpStatus.BAD_REQUEST,
        );
      }

      //[x] create notification
      await this.qwalletNotificationService.createDepositSuccessfulNotification();

      //[x] alert on websocket
      await this.notificationsGateway.emitDepositSuccessfulToUser(
        user.alertID,
        {},
      );
    } catch (error) {
      console.log(error);
    }
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
