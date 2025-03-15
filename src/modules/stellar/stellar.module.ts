import { Module } from '@nestjs/common';
import { StellarService } from './stellar.service';

@Module({
  controllers: [],
  providers: [StellarService],
})
export class StellarModule {}
