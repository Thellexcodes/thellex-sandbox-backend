import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRequestPaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { PaymentsService } from './payments.service';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { responseHandler } from '@/utils/helpers';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { BasicKycCheckerGuard } from '@/middleware/guards/basic-kyc-checker.guard';

ApiTags('payments');
@Controller('Payments')
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('request-crypto')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request a crypto payment' })
  async requestCryptoPayment(
    @Body() createRequestPaymentDto: CreateRequestPaymentDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;

    const requestResponse = await this.paymentService.requestCryptoWallet(
      createRequestPaymentDto,
      user,
    );

    responseHandler(requestResponse, res, req);
  }

  @Post('withdraw-crypto')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Withdrawal of crypto payment' })
  async withdrawPayment(
    @Body() withdrawPaymentDto: CreateCryptoWithdrawPaymentDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response =
      await this.paymentService.handleWithdrawCryptoPayment(withdrawPaymentDto);

    responseHandler(response, res, req);
  }

  @Post('on-ramp')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request a fiat payment' })
  async requestFiatPayment(@Body() createRequestPaymentDto: any) {
    //TODO: implement on-ramp
  }

  @Post('off-ramp')
  @UseGuards(AuthGuard, BasicKycCheckerGuard)
  @ApiOperation({ summary: 'Request a fiat payment' })
  async withdrawFiatPayment(@Body() createRequestPaymentDto: any) {
    console.log({ createRequestPaymentDto });
  }

  @Get()
  async feeEstimator() {}
}
