import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BridgeService } from './bridge.service';
import { CreateBridgeDto } from './dto/create-bridge.dto';
import { UpdateBridgeDto } from './dto/update-bridge.dto';

@Controller('bridge')
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  @Post()
  create(@Body() createBridgeDto: CreateBridgeDto) {
    return this.bridgeService.create(createBridgeDto);
  }

  @Get()
  findAll() {
    return this.bridgeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bridgeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBridgeDto: UpdateBridgeDto) {
    return this.bridgeService.update(+id, updateBridgeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bridgeService.remove(+id);
  }
}
