import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SwapService } from './swap.service';
import { CreateSwapDto } from './dto/create-swap.dto';
import { UpdateSwapDto } from './dto/update-swap.dto';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post('aggregate')
  async aggregate(@Body() body) {
    console.log(body);
  }

  @Post()
  create(@Body() createSwapDto: CreateSwapDto) {
    return this.swapService.create(createSwapDto);
  }

  @Get()
  findAll() {
    return this.swapService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swapService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSwapDto: UpdateSwapDto) {
    return this.swapService.update(+id, updateSwapDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.swapService.remove(+id);
  }
}
