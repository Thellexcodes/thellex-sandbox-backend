import { Module } from '@nestjs/common';
import { BridgeService } from './bridge.service';
import { BridgeController } from './bridge.controller';

@Module({
  controllers: [BridgeController],
  providers: [BridgeService],
})
export class BridgeModule {}
