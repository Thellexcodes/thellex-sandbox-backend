import { QWalletWebhookEventType } from '@/types/qwallet.types';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IQwalletHookDepositSuccessfulData,
  QwalletHookDepositSuccessfulEventDto,
} from './qwallet-hook-depositSuccessful.dto';
import {
  IQWalletHookWithdrawSuccessfulEvent,
  QWalletHookWithdrawSuccessfulEventDto,
} from './qwallet-hook-withdrawSuccessful.dto';

export type QWalletWebhookEventMap = {
  [QWalletWebhookEventType.DepositSuccessful]: IQwalletHookDepositSuccessfulData;
  [QWalletWebhookEventType.WithdrawalSuccessful]: IQWalletHookWithdrawSuccessfulEvent;
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
  @ApiProperty({ enum: Object.values(QWalletWebhookEventType) })
  event: QWalletWebhookEventType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(QwalletHookDepositSuccessfulEventDto) },
      { $ref: getSchemaPath(QWalletHookWithdrawSuccessfulEventDto) },
    ],
  })
  data: IQwalletHookDepositSuccessfulData | IQWalletHookWithdrawSuccessfulEvent;
}
