import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Headers,
  Req,
  HttpCode,
  Res,
} from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { CreateQwalletHookDto } from './dto/create-qwallet-hook.dto';
import { UpdateQwalletHookDto } from './dto/update-qwallet-hook.dto';
import { QwalletWebhookEvent } from '@/enums/qwallet-webhook-event.enum';
import { ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { RampHooksService } from './qwallet-ramp-hooks.service';
import { QWalletHooksDepositOnHoldDto } from './dto/qwallet-hooks-deposit-on-hold.dto';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { QWalletDepositSuccessfulPayloadDto } from './dto/qwallet-hook-depositSuccessful.dto';
import { responseHandler } from '@/utils/helpers';

@ApiTags('Qwallet Webhooks')
@Controller('qwallet-hooks')
export class QwalletHooksController {
  constructor(
    private readonly qwalletHooksService: QwalletHooksService,
    private readonly rampHooksService: RampHooksService,
  ) {}

  // @Post(QwalletWebhookEvent.WALLET_UPDATED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a wallet balance is updated',
  //   type: WebhookPayloadDto,
  // })
  // handleWalletUpdated(@Body() payload: any, @Headers() headers: any) {}

  @Post('wallet-updated')
  @ApiOperation({ summary: 'Handle wallet updated webhook' })
  // @ApiBody({ type: any }) // your DTO here
  handleWalletUpdated(@Body() dto: any) {
    return this.qwalletHooksService.handleWalletUpdated(dto);
  }

  // @Post(QwalletWebhookEvent.WALLET_ADDRESS_GENERATED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a wallet address is generated',
  //   type: WebhookPayloadDto,
  // })
  // handleWalletAddressGenerated(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.DEPOSIT_CONFIRMATION)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a deposit transaction is confirmed',
  //   type: WebhookPayloadDto,
  // })
  // handleDepositConfirmation(@Body() payload: any, @Headers() headers: any) {}

  @Post(QwalletWebhookEvent.DEPOSIT_SUCCESSFUL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Triggered when a deposit is successful' })
  @ApiBody({
    description: 'Payload for deposit successful webhook',
    type: QWalletDepositSuccessfulPayloadDto,
  })
  async handleDepositSuccessful(
    @Body() payload: QWalletDepositSuccessfulPayloadDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;

    const handelDepositResponse =
      await this.qwalletHooksService.handleDepositSuccessful(payload, user);

    responseHandler(handelDepositResponse, res, req);
  }

  // @Post(QwalletWebhookEvent.DEPOSIT_ON_HOLD)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a deposit is on hold',
  //   type: QWalletHooksDepositOnHoldDto,
  // })
  // handleDepositOnHold(
  //   // @Body() payload: QWalletHooksDepositOnHoldDto,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ) {
  //   console.log('hitting');
  // }

  // @Post(QwalletWebhookEvent.DEPOSIT_FAILED_AML)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a deposit fails due to AML checks',
  //   type: WebhookPayloadDto,
  // })
  // handleDepositFailedAml(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.DEPOSIT_REJECTED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a deposit is rejected',
  //   type: WebhookPayloadDto,
  // })
  // handleDepositRejected(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.WITHDRAW_SUCCESSFUL)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a withdrawal is successful',
  //   type: WebhookPayloadDto,
  // })
  // handleWithdrawSuccessful(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.WITHDRAW_REJECTED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a withdrawal is rejected',
  //   type: WebhookPayloadDto,
  // })
  // handleWithdrawRejected(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.ORDER_DONE)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when an order is completed',
  //   type: WebhookPayloadDto,
  // })
  // handleOrderDone(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.ORDER_CANCELLED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when an order is cancelled',
  //   type: WebhookPayloadDto,
  // })
  // handleOrderCancelled(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.SWAP_COMPLETED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a swap is completed',
  //   type: WebhookPayloadDto,
  // })
  // handleSwapCompleted(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.SWAP_REVERSED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a swap is reversed',
  //   type: WebhookPayloadDto,
  // })
  // handleSwapReversed(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.SWAP_FAILED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({
  //   description: 'Triggered when a swap fails',
  //   type: WebhookPayloadDto,
  // })
  // handleSwapFailed(@Body() payload: any, @Headers() headers: any) {}

  // @Post(QwalletWebhookEvent.SELL_SUCCESSFUL)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ description: 'Sell transaction successful payload' })
  // sellSuccessful(@Body() payload: any, @Headers() headers: any) {
  //   return this.rampHooksService.handleSellSuccessful(payload, headers);
  // }

  // @Post(QwalletWebhookEvent.SELL_PROCESSING)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ description: 'Sell transaction processing payload' })
  // sellProcessing(@Body() payload: any, @Headers() headers: any) {
  //   return this.rampHooksService.handleSellProcessing(payload, headers);
  // }

  // @Post(QwalletWebhookEvent.SELL_FAILED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ description: 'Sell transaction failed payload' })
  // sellFailed(@Body() payload: any, @Headers() headers: any) {
  //   return this.rampHooksService.handleSellFailed(payload, headers);
  // }

  // @Post(QwalletWebhookEvent.BUY_SUCCESSFUL)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ description: 'Buy transaction successful payload' })
  // buySuccessful(@Body() payload: any, @Headers() headers: any) {
  //   return this.rampHooksService.handleBuySuccessful(payload, headers);
  // }

  // @Post(QwalletWebhookEvent.BUY_PROCESSING)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ description: 'Buy transaction processing payload' })
  // buyProcessing(@Body() payload: any, @Headers() headers: any) {
  //   return this.rampHooksService.handleBuyProcessing(payload, headers);
  // }

  // @Post(QwalletWebhookEvent.BUY_FAILED)
  // @HttpCode(HttpStatus.OK)
  // @ApiBody({ description: 'Buy transaction failed payload' })
  // buyFailed(@Body() payload: any, @Headers() headers: any) {
  //   return this.rampHooksService.handleBuyFailed(payload, headers);
  // }
}
