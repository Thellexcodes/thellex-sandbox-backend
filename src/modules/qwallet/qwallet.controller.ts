import { Controller } from '@nestjs/common';
import { QwalletService } from './qwallet.service';

@Controller('qwallet')
export class QwalletController {
  constructor(private readonly qwalletService: QwalletService) {}
}
