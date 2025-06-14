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

  @Post('request-fiat')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request a fiat payment' })
  async requestFiatPayment(@Body() createRequestPaymentDto: any) {
    //TODO: implement on-ramp
  }

  @Post('withdraw-fiat')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request a fiat payment' })
  async withdrawFiatPayment(@Body() createRequestPaymentDto: any) {
    //TODO: implement off-ramp
  }

  @Post('withdraw-crypto')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Withdrawal of crypto payment' })
  async withdrawPayment(
    @Body() withdrawPaymentDto: CreateCryptoWithdrawPaymentDto,
    @Req() req: CustomRequest,
  ) {
    const user = req.user;
    return this.paymentService.handleWithdrawCryptoPayment(withdrawPaymentDto);
  }

  @Get()
  async feeEstimator() {}
}
