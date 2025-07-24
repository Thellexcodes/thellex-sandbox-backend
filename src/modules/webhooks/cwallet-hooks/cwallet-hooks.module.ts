import { Module } from '@nestjs/common';
import { CwalletHooksService } from './cwallet-hooks.service';
import { CwalletHooksController } from './cwallet-hooks.controller';

@Module({
  controllers: [CwalletHooksController],
  providers: [CwalletHooksService],
})
export class CwalletHooksModule {}
