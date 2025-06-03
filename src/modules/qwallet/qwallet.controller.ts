import { Controller } from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { CreateRequestPaymentDto } from './dto/create-request.dto';

@Controller('qwallet')
export class QwalletController {
  constructor(private readonly qwalletService: QwalletService) {}
}
