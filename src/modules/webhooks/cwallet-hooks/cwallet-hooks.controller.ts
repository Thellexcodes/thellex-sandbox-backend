import { Controller, Post, Body, Req, Res, Logger } from '@nestjs/common';
import { CwalletHooksService } from './cwallet-hooks.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CwalletHookDto } from './dto/create-cwallet-hook.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { CircleNotificationTypeEnum } from '@/models/wallet-manager.types';
import { normalizeEnumValue, responseHandler } from '@/utils/helpers';

//TODO: add cwallet security middleware
@ApiTags('Web Hooks')
@Controller('cwallet-hooks')
export class CwalletHooksController {
  private readonly logger = new Logger(CwalletHooksController.name);

  constructor(private readonly cwalletHooksService: CwalletHooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Webhook endpoint to handle CWallet events',
    description: `
        This endpoint receives webhook callbacks from CWallet (Circle-based wallets) for various wallet-related events.

        Currently supported events include:
        - \`wallet.transaction.created\`: Triggered when a wallet transaction is initiated.
        - \`wallet.transaction.confirmed\`: Triggered when a transaction is confirmed on-chain.
        - \`wallet.transaction.failed\`: Triggered when a transaction fails.

        The request body contains event details such as blockchain, token ID, transaction type, state, and references.  
        The endpoint ensures secure handling and processing of wallet event payloads from Circle's webhook service.
      `,
  })
  async create(
    @Body() payload: CwalletHookDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const notificationType = normalizeEnumValue(
      payload.notificationType,
      CircleNotificationTypeEnum,
    );

    switch (notificationType) {
      case CircleNotificationTypeEnum.TransactionsInbound:
        await this.cwalletHooksService.handleDepositSuccessful(payload);
        break;
      case CircleNotificationTypeEnum.TransactionsOutbound:
        await this.cwalletHooksService.handleWithdrawSuccessful(payload);
        break;
      default:
        return responseHandler('', res, req);
    }
    return responseHandler('', res, req);
  }
}
