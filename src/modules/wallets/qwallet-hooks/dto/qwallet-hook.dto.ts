import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IQwalletHookDepositSuccessfulData,
  QwalletHookDepositSuccessfulEventDto,
} from './qwallet-hook-depositSuccessful.dto';
import {
  IQWalletHookWithdrawSuccessfulEvent,
  QWalletHookWithdrawSuccessfulEventDto,
} from './qwallet-hook-withdrawSuccessful.dto';
import { WalletWebhookEventEnum } from '@/types/wallet-manager.types';
import {
  IQWalletAddressGenerated,
  QWalletAddressGeneratedDto,
} from './qwallet-hook-walletUpdated.dto';

export type QWalletWebhookEventMap = {
  [WalletWebhookEventEnum.DepositSuccessful]: IQwalletHookDepositSuccessfulData;
  [WalletWebhookEventEnum.WithdrawalSuccessful]: IQWalletHookWithdrawSuccessfulEvent;
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
  @ApiProperty({ enum: Object.values(WalletWebhookEventEnum) })
  event: WalletWebhookEventEnum;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(QwalletHookDepositSuccessfulEventDto) },
      { $ref: getSchemaPath(QWalletHookWithdrawSuccessfulEventDto) },
      { $ref: getSchemaPath(QWalletAddressGeneratedDto) },
    ],
  })
  data:
    | IQwalletHookDepositSuccessfulData
    | IQWalletHookWithdrawSuccessfulEvent
    | IQWalletAddressGenerated;
}
