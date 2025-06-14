import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CwalletHooksService } from './cwallet-hooks.service';
import { CreateCwalletHookDto } from './dto/create-cwallet-hook.dto';
import { UpdateCwalletHookDto } from './dto/update-cwallet-hook.dto';

@Controller('cwallet-hooks')
export class CwalletHooksController {
  constructor(private readonly cwalletHooksService: CwalletHooksService) {}

  @Post()
  create(@Body() createCwalletHookDto: CreateCwalletHookDto) {
    return this.cwalletHooksService.create(createCwalletHookDto);
  }

  @Get()
  findAll() {
    return this.cwalletHooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cwalletHooksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCwalletHookDto: UpdateCwalletHookDto) {
    return this.cwalletHooksService.update(+id, updateCwalletHookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cwalletHooksService.remove(+id);
  }
}
