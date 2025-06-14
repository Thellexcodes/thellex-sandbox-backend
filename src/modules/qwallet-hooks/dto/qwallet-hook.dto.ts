import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IQwalletHookDepositSuccessfulData,
  QwalletHookDepositSuccessfulEventDto,
} from './qwallet-hook-depositSuccessful.dto';
import {
  IQWalletHookWithdrawSuccessfulEvent,
  QWalletHookWithdrawSuccessfulEventDto,
} from './qwallet-hook-withdrawSuccessful.dto';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';

export type QWalletWebhookEventMap = {
  [WalletWebhookEventType.DepositSuccessful]: IQwalletHookDepositSuccessfulData;
  [WalletWebhookEventType.WithdrawalSuccessful]: IQWalletHookWithdrawSuccessfulEvent;
};

export type QWalletWebhookPayload = {
  [K in keyof QWalletWebhookEventMap]: {
    event: K;
    data: QWalletWebhookEventMap[K];
  };
}[keyof QWalletWebhookEventMap];

@ApiExtraModels(
  QwalletHookDepositSuccessfulEventDto,
  QWalletHookWithdrawSuccessfulEventDto,
)
export class QWalletWebhookPayloadDto {
  @ApiProperty({ enum: Object.values(WalletWebhookEventType) })
  event: WalletWebhookEventType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(QwalletHookDepositSuccessfulEventDto) },
      { $ref: getSchemaPath(QWalletHookWithdrawSuccessfulEventDto) },
    ],
  })
  data: IQwalletHookDepositSuccessfulData | IQWalletHookWithdrawSuccessfulEvent;
}
