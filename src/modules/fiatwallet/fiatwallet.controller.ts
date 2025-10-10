import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { CreateFiatwalletDto } from './dto/create-fiatwallet.dto';
import { UpdateFiatwalletDto } from './dto/update-fiatwallet.dto';

@Controller('fiatwallet')
export class FiatwalletController {
  constructor(private readonly fiatwalletService: FiatwalletService) {}

  @Post()
  create(@Body() createFiatwalletDto: CreateFiatwalletDto) {
    return this.fiatwalletService.create(createFiatwalletDto);
  }

  @Get()
  findAll() {
    return this.fiatwalletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiatwalletService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiatwalletDto: UpdateFiatwalletDto) {
    return this.fiatwalletService.update(+id, updateFiatwalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiatwalletService.remove(+id);
  }
}
