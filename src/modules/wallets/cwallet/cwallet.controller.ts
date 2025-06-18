import { Controller } from '@nestjs/common';
import { CwalletService } from './cwallet.service';

@Controller('cwallet')
export class CwalletController {
  constructor(private readonly cwalletService: CwalletService) {}
}
