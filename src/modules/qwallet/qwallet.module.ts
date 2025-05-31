import { Module } from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { QwalletController } from './qwallet.controller';

@Module({
  controllers: [QwalletController],
  providers: [QwalletService],
})
export class QwalletModule {}
