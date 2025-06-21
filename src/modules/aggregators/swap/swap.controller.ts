import { Controller, Get, Query } from '@nestjs/common';
import { SwapService } from './swap.service';
import { RateDto } from './dto/rate.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get('v2Rate')
  async getUniswapV2Rate(@Query() queryParams: RateDto) {
    return await this.swapService.v2Rate(queryParams);
  }

  @Get('v3Rate')
  async getUniswapV3Rate(@Query() queryParams: RateDto) {
    return await this.swapService.v3Rate(queryParams);
  }
}
