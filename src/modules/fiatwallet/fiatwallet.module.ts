import { Module } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { FiatwalletController } from './fiatwallet.controller';

@Module({
  controllers: [FiatwalletController],
  providers: [FiatwalletService],
})
export class FiatwalletModule {}
