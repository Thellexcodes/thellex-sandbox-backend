import { Controller, Get, Query } from '@nestjs/common';
import { SwapService } from './swap.service';
import { V2RateDto } from './dto/v2-rate.dto';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get('v2Rate')
  async getUniswapV2Rate(@Query() queryParams: V2RateDto) {
    return await this.swapService.v2Rate(queryParams);
  }
}
