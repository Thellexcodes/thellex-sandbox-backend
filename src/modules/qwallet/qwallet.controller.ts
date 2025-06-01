import { Controller, Post, Body } from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { CreateQwalletDto } from './dto/create-qwallet.dto';

@Controller('qwallet')
export class QwalletController {
  constructor(private readonly qwalletService: QwalletService) {}
}
