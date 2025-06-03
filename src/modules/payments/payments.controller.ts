import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRequestPaymentDto } from './dto/create-payment.dto';

ApiTags('Payments');
@Controller('Payments')
export class PaymentsController {
  @Post('request-payment')
  @ApiTags('Payments')
  @ApiOperation({ summary: 'Request a crypto payment' })
  async requestPayment(
    @Body() createRequestPaymentDto: CreateRequestPaymentDto,
  ) {
    // your logic here
  }
}
