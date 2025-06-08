import { QWalletWebhookEventType } from '@/types/qwallet.types';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IQwalletHookDepositSuccessfulData,
  QwalletHookDepositSuccessfulDataDto,
} from './qwallet-hook-depositSuccessful.dto';

// 3. Map event to data type
export type QWalletWebhookEventMap = {
  [QWalletWebhookEventType.DepositSuccessful]: IQwalletHookDepositSuccessfulData;
  // [QWalletWebhookEventType.WithdrawalSuccessful]: IQwalletHookWithdrawalSuccessfulData;
};

// 4. Union type for internal use
export type QWalletWebhookPayload = {
  [K in keyof QWalletWebhookEventMap]: {
    event: K;
    data: QWalletWebhookEventMap[K];
  };
}[keyof QWalletWebhookEventMap];

@ApiExtraModels(QwalletHookDepositSuccessfulDataDto)
export class QWalletWebhookPayloadDto {
  @ApiProperty({ enum: Object.values(QWalletWebhookEventType) })
  event: QWalletWebhookEventType;

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(QwalletHookDepositSuccessfulDataDto) }],
  })
  data: IQwalletHookDepositSuccessfulData;
}
