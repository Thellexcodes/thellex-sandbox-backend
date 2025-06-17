import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { CwalletHooksService } from './cwallet-hooks.service';
import { ApiTags } from '@nestjs/swagger';
import { CwalletHookDto } from './dto/create-cwallet-hook.dto';
import { CustomRequest } from '@/types/request.types';
import { CircleNotificationType } from '@/types/wallet-manager.types';

@ApiTags('WebHooks')
@Controller('cwallet-hooks')
export class CwalletHooksController {
  constructor(private readonly cwalletHooksService: CwalletHooksService) {}

  @Post()
  create(@Body() payload: CwalletHookDto, @Req() req: CustomRequest) {
    const user = req.user;

    // switch (payload.notificationType) {
    //   case CircleNotificationType.TransactionsInbound:
    //     this.cwalletHooksService.handleDepositSuccessful(payload);

    //   case CircleNotificationType.TransactionsOutbound:
    //     this.cwalletHooksService.handleWithdrawSuccessful(payload);
    //   default:
    //     return null;
    // }

    //     {
    //   subscriptionId: 'b3ca6bfa-8bff-4c29-a11b-50f73d79996d',
    //   notificationId: 'ee7ada73-01f6-416d-a552-b9126a4e9f8a',
    //   notificationType: 'transactions.outbound',
    //   notification: {
    //     id: '194afcae-bf4b-55a5-b8b0-84198a5a478c',
    //     blockchain: 'MATIC-AMOY',
    //     walletId: '330db6bb-3b35-5376-b47f-10d1ee7a198e',
    //     tokenId: '36b6931a-873a-56a8-8a27-b706b17104ee',
    //     sourceAddress: '0x1b7a716d5d890231f4acdc0068a6ddb21c2eb72f',
    //     destinationAddress: '0x1fcb25fb286d9fa084c09988b64b40571446cde7',
    //     amounts: [ '1' ],
    //     nftTokenIds: [],
    //     refId: '',
    //     state: 'PENDING_RISK_SCREENING',
    //     errorReason: '',
    //     transactionType: 'OUTBOUND',
    //     createDate: '2025-06-15T04:38:46Z',
    //     updateDate: '2025-06-15T04:38:46Z',
    //     errorDetails: null
    //   },
    //   timestamp: '2025-06-15T04:38:46.648823582Z',
    //   version: 2
    // }
    // [2025-06-15T04:38:47.407Z] POST /cwallet-hooks
    // {
    //   subscriptionId: 'b3ca6bfa-8bff-4c29-a11b-50f73d79996d',
    //   notificationId: 'c338672c-e088-4b1e-a1a1-2e80951a2f95',
    //   notificationType: 'transactions.outbound',
    //   notification: {
    //     id: '194afcae-bf4b-55a5-b8b0-84198a5a478c',
    //     blockchain: 'MATIC-AMOY',
    //     walletId: '330db6bb-3b35-5376-b47f-10d1ee7a198e',
    //     tokenId: '36b6931a-873a-56a8-8a27-b706b17104ee',
    //     sourceAddress: '0x1b7a716d5d890231f4acdc0068a6ddb21c2eb72f',
    //     destinationAddress: '0x1fcb25fb286d9fa084c09988b64b40571446cde7',
    //     amounts: [ '1' ],
    //     nftTokenIds: [],
    //     refId: '',
    //     state: 'QUEUED',
    //     errorReason: '',
    //     transactionType: 'OUTBOUND',
    //     createDate: '2025-06-15T04:38:46Z',
    //     updateDate: '2025-06-15T04:38:46Z',
    //     errorDetails: null
    //   },
    //   timestamp: '2025-06-15T04:38:47.171652520Z',
    //   version: 2
    // }
    // [2025-06-15T04:38:48.179Z] POST /cwallet-hooks
    // {
    //   subscriptionId: 'b3ca6bfa-8bff-4c29-a11b-50f73d79996d',
    //   notificationId: '9be321ba-c7f9-4b68-8cdd-d4810d51a9cb',
    //   notificationType: 'transactions.outbound',
    //   notification: {
    //     id: '3',
    //     blockchain: 'MATIC-AMOY',
    //     walletId: '330db6bb-3b35-5376-b47f-10d1ee7a198e',
    //     tokenId: '36b6931a-873a-56a8-8a27-b706b17104ee',
    //     sourceAddress: '0x1b7a716d5d890231f4acdc0068a6ddb21c2eb72f',
    //     destinationAddress: '0x1fcb25fb286d9fa084c09988b64b40571446cde7',
    //     amounts: [ '1' ],
    //     nftTokenIds: [],
    //     refId: '',
    //     state: 'SENT',
    //     errorReason: '',
    //     transactionType: 'OUTBOUND',
    //     userOpHash: '0x8a6cbe0b0fdc3aecd35ba85c0f51d676536b21c51216c64b27006b2258d36761',
    //     createDate: '2025-06-15T04:38:46Z',
    //     updateDate: '2025-06-15T04:38:47Z',
    //     errorDetails: null
    //   },
    //   timestamp: '2025-06-15T04:38:47.861545688Z',
    //   version: 2
    // }
    // [2025-06-15T04:38:57.992Z] POST /cwallet-hooks
    // {
    //   subscriptionId: 'b3ca6bfa-8bff-4c29-a11b-50f73d79996d',
    //   notificationId: '285ca556-1731-422c-93e7-7baaee40c73a',
    //   notificationType: 'transactions.outbound',
    //   notification: {
    //     id: '194afcae-bf4b-55a5-b8b0-84198a5a478c',
    //     blockchain: 'MATIC-AMOY',
    //     walletId: '330db6bb-3b35-5376-b47f-10d1ee7a198e',
    //     tokenId: '36b6931a-873a-56a8-8a27-b706b17104ee',
    //     sourceAddress: '0x1b7a716d5d890231f4acdc0068a6ddb21c2eb72f',
    //     destinationAddress: '0x1fcb25fb286d9fa084c09988b64b40571446cde7',
    //     amounts: [ '1' ],
    //     nftTokenIds: [],
    //     refId: '',
    //     state: 'CONFIRMED',
    //     errorReason: '',
    //     transactionType: 'OUTBOUND',
    //     txHash: '0x2d9d272207d41aef92a432910f087816cfe4281601dafcb109cb4320376c8f65',
    //     userOpHash: '0x8a6cbe0b0fdc3aecd35ba85c0f51d676536b21c51216c64b27006b2258d36761',
    //     createDate: '2025-06-15T04:38:46Z',
    //     updateDate: '2025-06-15T04:38:57Z',
    //     errorDetails: null,
    //     networkFee: '0.062665086076602'
    //   },
    //   timestamp: '2025-06-15T04:38:57.740098744Z',
    //   version: 2
    // }
  }
}
