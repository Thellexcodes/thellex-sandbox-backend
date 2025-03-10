import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
// import { Token } from '@/thellex-sdk/src';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiQuery({
    name: 'chainId',
    required: false,
    description:
      'The chain ID to filter tokens by. If omitted, all tokens will be returned.',
    type: Number,
  })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of tokens for the specified chain ID.',
  //   type: [Token],
  // })
  @ApiResponse({
    status: 404,
    description: 'Chain ID not supported.',
  })
  findAll() {
    return this.tokenService.findAll();
  }

  @Get('h_data')
  findToken(
    @Query('id') id: string,
    @Query('symbol') symbol?: string,
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('current_price') currentPrice?: string,
    @Query('price_change_percentage_24h')
    priceChangePercentage24h?: string,
    @Query('market_cap') marketCap?: string,
    @Query('image') image?: string,
  ) {
    const tokenData = {
      id,
      symbol,
      name,
      address,
      currentPrice,
      priceChangePercentage24h,
      marketCap,
      image,
    };

    if (tokenData.id) return this.tokenService.findOne(tokenData);
  }
}
