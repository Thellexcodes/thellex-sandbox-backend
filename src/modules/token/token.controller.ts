import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Token } from '@/thellex-sdk-v1/src';

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
  @ApiResponse({
    status: 200,
    description: 'List of tokens for the specified chain ID.',
    type: [Token],
  })
  @ApiResponse({
    status: 404,
    description: 'Chain ID not supported.',
  })
  findAll() {
    return this.tokenService.findAll();
  }
}
