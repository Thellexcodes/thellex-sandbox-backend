import { Module } from '@nestjs/common';
import { FiatYellowcardService } from './fiat-yellowcard.service';
import { FiatYellowcardController } from './fiat-yellowcard.controller';

@Module({
  controllers: [FiatYellowcardController],
  providers: [FiatYellowcardService],
})
export class FiatYellowcardModule {}
