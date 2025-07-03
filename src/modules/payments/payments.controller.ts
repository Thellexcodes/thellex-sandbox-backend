import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { ConfirmCollectionRequestDto } from './dto/confirm-collection-request.dto';
import {
  FiatCollectionRequestDto,
  FiatCollectionResponseDto,
} from './dto/fiat-collection-request.dto';
import { RequestCryptoOffRampPaymentDto } from './dto/request-crypto-offramp-payment.dto';
import { CreateWithdrawalResponseDto } from './dto/payment.dto';

ApiTags('Payments');
@Controller('payments')
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get('channels')
  async channels(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const response = await this.paymentService.handleGetPaymentChannels();
    responseHandler(response, res, req);
  }

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
    responseHandler('', res, req);
  }

  @Post('fiat-collection-request')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiBody({ type: FiatCollectionRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Fiat payment request created successfully',
    type: FiatCollectionResponseDto,
  })
  @ApiOperation({ summary: 'Request a fiat payment' })
  async requestFiatPayment(
    @Body() fiatCollectionRequestDto: FiatCollectionRequestDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const response = await this.paymentService.handleYcOnRamp(
      user,
      fiatCollectionRequestDto,
    );
    responseHandler(response, res, req);
  }

  @Post('confirm-collection-request')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiOperation({ summary: 'Request a fiat payment' })
  async confirmFiatCollectionRequest(
    @Body() createRequestPaymentDto: ConfirmCollectionRequestDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const response = await this.paymentService.handleConfirmCollectionRequest(
      createRequestPaymentDto,
      user,
    );
    responseHandler(response, res, req);
  }

  @Post('offramp-crypto')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiOperation({ summary: 'Request a fiat payment (off-ramp)' })
  async requestOffRampFiatPayment(
    @Body() requestOffRampDto: RequestCryptoOffRampPaymentDto,
  ) {
    console.log({ requestOffRampDto });
  }

  // @Get()
  // async feeEstimator() {}

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
