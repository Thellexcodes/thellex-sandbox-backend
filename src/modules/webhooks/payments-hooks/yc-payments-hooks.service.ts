import { Injectable } from '@nestjs/common';
import { YcCreatePaymentDto } from './dto/yc-create-payment.dto';

@Injectable()
export class YcPaymentHookService {
  create(createPaymentDto: YcCreatePaymentDto) {
    console.log({ createPaymentDto });
  }
}
