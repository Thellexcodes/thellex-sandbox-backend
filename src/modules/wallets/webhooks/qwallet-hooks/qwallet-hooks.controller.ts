import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QWalletWebhookPayloadDto } from './dto/qwallet-hook.dto';
import { WalletWebhookEventEnum } from '@/models/wallet-manager.types';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';

//TODO: add qwallet security middleware
@ApiTags('Web Hooks')
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
          - \`wallet.address.generated\`: Triggered when a new wallet address is generated for a user. 
          The payload contains the event type and event-specific data.  The request is authenticated to ensure only authorized sources can post data.
        `,
  })
  @ApiBody({
    description:
      'Payload containing the wallet event type and its corresponding data',
    type: QWalletWebhookPayloadDto,
  })
  async handleQWalletWebhook(
    @Body() payload: QWalletWebhookPayloadDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    switch (payload.event) {
      case WalletWebhookEventEnum.DepositSuccessful:
        await this.qwalletHooksService.handleDepositSuccessful(payload);
        break;
      case WalletWebhookEventEnum.WithdrawalSuccessful:
        await this.qwalletHooksService.handleWithdrawSuccessful(payload);
        break;
      case WalletWebhookEventEnum.WalletAddressGenerated:
        await this.qwalletHooksService.handleWalletAddressGenerated(payload);
        break;
      default:
        return responseHandler('', res, req);
    }

    return responseHandler('', res, req);
  }
}
