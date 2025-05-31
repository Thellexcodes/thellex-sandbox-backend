import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QwalletService } from './qwallet.service';
import { CreateQwalletDto } from './dto/create-qwallet.dto';
import { UpdateQwalletDto } from './dto/update-qwallet.dto';
import axios from 'axios';

@Controller('qwallet')
export class QwalletController {
  constructor(private readonly qwalletService: QwalletService) {}

  @Post()
  create(@Body() createQwalletDto: CreateQwalletDto) {
    return this.qwalletService.create(createQwalletDto);
  }

  @Get()
  findAll() {
    return this.qwalletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qwalletService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQwalletDto: UpdateQwalletDto) {
    return this.qwalletService.update(+id, updateQwalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qwalletService.remove(+id);
  }
}
