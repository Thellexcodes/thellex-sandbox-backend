import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Req,
  HttpCode,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { QWalletWebhookEventType } from '@/types/qwallet.types';
import { QWalletWebhookPayloadDto } from './dto/qwallet-hook.dto';

//TODO: add qwallet security middleware
@ApiTags('WebHooks')
@Controller('qwallet-hooks')
@ApiBearerAuth('access-token')
export class QwalletHooksController {
  constructor(private readonly qwalletHooksService: QwalletHooksService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
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
  async handleDepositSuccessful(
    @Body()
    payload: QWalletWebhookPayloadDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;

    switch (payload.event) {
      case QWalletWebhookEventType.DepositSuccessful:
        return this.qwalletHooksService.handleDepositSuccessful(payload, user);
      case QWalletWebhookEventType.WithdrawalSuccessful:
        return this.qwalletHooksService.handleWithdrawSuccessful(payload, user);
      default:
        return null;
    }
  }
}
