import { Controller, Post, Body, Req } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QWalletWebhookPayloadDto } from './dto/qwallet-hook.dto';
import { WalletWebhookEventEnum } from '@/types/wallet-manager.types';

//TODO: add qwallet security middleware
@ApiTags('WebHooks')
@Controller('qwallet-hooks')
@ApiBearerAuth('access-token')
export class QwalletHooksController {
  constructor(private readonly qwalletHooksService: QwalletHooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Webhook endpoint to handle qwallet events',
    description: `
  This endpoint receives webhook callbacks from QWallet for various wallet-related events.  
  Currently supported events include:
  - \`deposit.successful\`: Triggered when a user deposit is successfully processed.
  - \`withdrawal.successful\`: Triggered when a user withdrawal is successfully processed.

The payload contains the event type and event-specific data.  
  The request is authenticated to ensure only authorized sources can post data.
  `,
  })
  @ApiBody({
    description:
      'Payload containing the wallet event type and its corresponding data',
    type: QWalletWebhookPayloadDto,
  })
  async handleQWalletWebhook(@Body() payload: QWalletWebhookPayloadDto) {
    switch (payload.event) {
      case WalletWebhookEventEnum.DepositSuccessful:
        return await this.qwalletHooksService.handleDepositSuccessful(payload);
      case WalletWebhookEventEnum.WithdrawalSuccessful:
        return await this.qwalletHooksService.handleWithdrawSuccessful(payload);
      case WalletWebhookEventEnum.WalletAddressGenerated:
        return await this.qwalletHooksService.handleWalletUpdated(payload);
      default:
        return null;
    }
  }
}
