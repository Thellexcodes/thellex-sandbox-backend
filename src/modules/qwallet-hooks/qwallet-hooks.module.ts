import { Module } from '@nestjs/common';
import { QwalletHooksService } from './qwallet-hooks.service';
import { QwalletHooksController } from './qwallet-hooks.controller';
import { RampHooksService } from './qwallet-ramp-hooks.service';

@Module({
  controllers: [QwalletHooksController],
  providers: [QwalletHooksService, RampHooksService],
})
export class QwalletHooksModule {}
