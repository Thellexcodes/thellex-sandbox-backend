import { Module } from '@nestjs/common';
import { HdwalletService } from './hdwallet.service';
import { HdwalletController } from './hdwallet.controller';

@Module({
  controllers: [HdwalletController],
  providers: [HdwalletService],
})
export class HdwalletModule {}
