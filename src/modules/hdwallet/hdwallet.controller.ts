import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HdwalletService } from './hdwallet.service';
import { CreateHdwalletDto } from './dto/create-hdwallet.dto';
import { UpdateHdwalletDto } from './dto/update-hdwallet.dto';

@Controller('hdwallet')
export class HdwalletController {
  constructor(private readonly hdwalletService: HdwalletService) {}

  @Post('create')
  createHdWallet(@Body() createHdwalletDto: CreateHdwalletDto) {
    return this.hdwalletService.create(createHdwalletDto);
  }

  @Get()
  findAll() {
    return this.hdwalletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hdwalletService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHdwalletDto: UpdateHdwalletDto,
  ) {
    return this.hdwalletService.update(+id, updateHdwalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hdwalletService.remove(+id);
  }
}
