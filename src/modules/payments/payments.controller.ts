import { Body, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { PaymentsService } from './payments.service';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { BasicKycCheckerGuard } from '@/middleware/guards/basic-kyc-checker.guard';
import {
  FiatToCryptoOnRampRequestDto,
  IFiatToCryptoOnRampResponseDto,
} from './dto/fiat-to-crypto-request.dto';
import {
  CreateWithdrawalResponseDto,
  IFiatToCryptoQuoteResponseDto,
} from './dto/payment.dto';
import { VersionedController001 } from '../controller/base.controller';
import { FiatEnum } from '@/config/settings';
import { RequestCryptoOffRampPaymentDto } from './dto/request-crypto-offramp-payment.dto';

ApiTags('Payments');
@VersionedController001('payments')
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('withdraw-crypto')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Withdrawal of crypto payment' })
  @ApiOkResponse({ type: CreateWithdrawalResponseDto })
  async withdrawPayment(
    @Body() withdrawPaymentDto: CreateCryptoWithdrawPaymentDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response =
      await this.paymentService.handleWithdrawCryptoPayment(withdrawPaymentDto);
    responseHandler(response, res, req);
  }

  @Post('fiat-to-crypto/onramp')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiBody({ type: FiatToCryptoOnRampRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Fiat-to-crypto onramp request created successfully',
    type: IFiatToCryptoOnRampResponseDto,
  })
  @ApiOperation({ summary: 'Initiate fiat-to-crypto onramp transaction' })
  async initiateFiatToCryptoOnRamp(
    @Body() dto: FiatToCryptoOnRampRequestDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const response = await this.paymentService.handleCryptoToFiatOnRamp(
      user,
      dto,
    );
    responseHandler(response, res, req);
  }

  @Post('fiat-to-crypto/offramp')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiOperation({ summary: 'Request a fiat payment (off-ramp)' })
  async requestOffRampFiatPayment(
    @Body() dto: RequestCryptoOffRampPaymentDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const response = await this.paymentService.handleCryptoToFiatOffRamp(
      user,
      dto,
    );
    responseHandler(response, res, req);
  }

  @Get('rates/:fiatCode?')
  @ApiOkResponse({ type: IFiatToCryptoQuoteResponseDto })
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  async rates(
    @Query('fiatCode') fiatCode: FiatEnum,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const result = await this.paymentService.handleRates(fiatCode);
    responseHandler(result, res, req);
  }

  //[x] ensure admin
  //[x] update payload
  @Post('set-yc-hook')
  async setYcWebhookConfig(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response = await this.paymentService.handleActivateYcWebhook();
    responseHandler(response, res, req);
  }
}
