import { Controller } from '@nestjs/common';
import { QwalletService } from './qwalletProfile.service';

@Controller('qwallet')
export class QwalletController {
  constructor(private readonly qwalletService: QwalletService) {}
}
