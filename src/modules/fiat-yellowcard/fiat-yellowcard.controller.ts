import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiatYellowcardService } from './fiat-yellowcard.service';
import { CreateFiatYellowcardDto } from './dto/create-fiat-yellowcard.dto';
import { UpdateFiatYellowcardDto } from './dto/update-fiat-yellowcard.dto';

@Controller('fiat-yellowcard')
export class FiatYellowcardController {
  constructor(private readonly fiatYellowcardService: FiatYellowcardService) {}

  @Post()
  create(@Body() createFiatYellowcardDto: CreateFiatYellowcardDto) {
    return this.fiatYellowcardService.create(createFiatYellowcardDto);
  }

  @Get()
  findAll() {
    return this.fiatYellowcardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiatYellowcardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiatYellowcardDto: UpdateFiatYellowcardDto) {
    return this.fiatYellowcardService.update(+id, updateFiatYellowcardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiatYellowcardService.remove(+id);
  }
}
