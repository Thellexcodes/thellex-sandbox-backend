import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IQwalletHookDepositSuccessfulData,
  QwalletHookDepositSuccessfulEventDto,
} from './qwallet-hook-depositSuccessful.dto';
import {
  IQWalletHookWithdrawSuccessfulEvent,
  QWalletHookWithdrawSuccessfulEventDto,
} from './qwallet-hook-withdrawSuccessful.dto';
import { WalletWebhookEventEnum } from '@/v1/models/wallet-manager.types';
import {
  IQWalletAddressGenerated,
  QWalletAddressGeneratedDto,
} from './qwallet-hook-walletUpdated.dto';
import { IsEnum } from 'class-validator';
import { normalizeEnumValue } from '@/v1/utils/helpers';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => normalizeEnumValue(value, WalletWebhookEventEnum))
  @IsEnum(WalletWebhookEventEnum)
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
