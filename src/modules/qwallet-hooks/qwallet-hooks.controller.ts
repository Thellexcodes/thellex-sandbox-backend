import { Controller, Post, Body, Req } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomRequest } from '@/types/request.types';
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
      default:
        return null;
    }
  }
}

// const w = {
//   event: 'wallet.address.generated',
//   data: {
//     id: '05f11b08-b707-4f1c-b91c-19c257e6e11f',
//     reference: null,
//     currency: 'usdt',
//     address: '0x370f947d656382F9B834898dc08dba4A9C872444',
//     network: 'bep20',
//     user: {
//       id: '9c9743e4-353d-457e-b462-f31275922be3',
//       sn: 'QDXY2ST53J7',
//       email: '3a90618f-58dd-41ceasrwqerqwefasdf-0bd24fda6366@emailhook.site',
//       reference: null,
//       first_name: null,
//       last_name: null,
//       display_name: null,
//       created_at: '2025-06-17T18:53:12.000Z',
//       updated_at: '2025-06-17T18:53:12.000Z',
//     },
//     destination_tag: null,
//     total_payments: null,
//     created_at: '2025-06-17T18:53:13.000Z',
//     updated_at: '2025-06-17T18:53:18.000Z',
//   },
// };
