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
import { FiatToCryptoOnRampRequestDto } from './dto/fiat-to-crypto-request.dto';
import { CreateWithdrawalResponseDto } from './dto/payment.dto';
import { VersionedController001 } from '../controller/base.controller';
import { FiatEnum } from '@/config/settings';
import { RequestCryptoOffRampPaymentDto } from './dto/request-crypto-offramp-payment.dto';
import { SuperAdminGuard } from '@/middleware/guards/super-admin.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policy.decorator';
import { CanManageCompany } from '../auth/policies/company-admin.policy';
import {
  IFiatToCryptoQuoteSummaryResponseDto,
  IRatesResponseDto,
} from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { CreateFiatWithdrawPaymentDto } from './dto/create-withdraw-fiat.dto';

ApiTags('Payments');
@VersionedController001('payments')
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('withdraw-fiat')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Withdrawal of crypto payment' })
  @ApiOkResponse({ type: CreateWithdrawalResponseDto })
  async withdrawPayment(
    @Body() withdrawPaymentDto: CreateFiatWithdrawPaymentDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const response = await this.paymentService.handleWithdrawFiatPayment(
      user,
      withdrawPaymentDto,
    );
    responseHandler(response, res, req);
  }

  @Post('withdraw-crypto')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiOperation({ summary: 'Withdrawal of crypto payment' })
  @ApiOkResponse({ type: CreateWithdrawalResponseDto })
  async withdrawFiat(
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
    type: IFiatToCryptoQuoteSummaryResponseDto,
  })
  @ApiOperation({ summary: 'Initiate fiat-to-crypto onramp transaction' })
  async initiateFiatToCryptoOnRamp(
    @Body() dto: FiatToCryptoOnRampRequestDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const response = await this.paymentService.handleFiatToCryptoOffRamp(
      user,
      dto,
    );
    responseHandler(response, res, req);
  }

  @Post('crypto-to-fiat/offramp')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiOperation({ summary: 'Request a fiat payment (off-ramp)' })
  @ApiResponse({
    status: 201,
    description: 'Fiat-to-crypto onramp request created successfully',
    type: IFiatToCryptoQuoteSummaryResponseDto,
  })
  // @Body() dto: RequestCryptoOffRampPaymentDto,
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
  @ApiOkResponse({ type: IRatesResponseDto })
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  async rates(
    @Query('fiatCode') fiatCode: FiatEnum,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const result = await this.paymentService.handleRates(fiatCode, user, 10);
    responseHandler(result, res, req);
  }

  // @Get('supported-banks')
  // @ApiOkResponse({ type: IRatesResponseDto })
  // @UseGuards(AuthGuard, BasicKycCheckerGuard)
  // async rates(
  //   @Query('fiatCode') fiatCode: FiatEnum,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ) {
  //   const user = req.user;
  //   const result = await this.paymentService.handleRates(fiatCode, user, 10);
  //   responseHandler(result, res, req);
  // }

  // @UseGuards(PoliciesGuard, SuperAdminGuard)
  // @CheckPolicies(CanManageCompany)
  @Post('set-yc-hook')
  @UseGuards(AuthGuard)
  async setYcWebhookConfig(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response = await this.paymentService.handleActivateYcWebhook();
    responseHandler(response, res, req);
  }
}
