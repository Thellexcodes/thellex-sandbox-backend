import { Module } from '@nestjs/common';
import { DkycService } from './dkyc.service';
import { DkycController } from './dkyc.controller';

@Module({
  controllers: [DkycController],
  providers: [DkycService],
})
export class DkycModule {}
