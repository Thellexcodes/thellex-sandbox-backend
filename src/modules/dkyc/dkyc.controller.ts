import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DkycService } from './dkyc.service';
import { CreateDkycDto } from './dto/create-dkyc.dto';
import { UpdateDkycDto } from './dto/update-dkyc.dto';

@Controller('dkyc')
export class DkycController {
  constructor(private readonly dkycService: DkycService) {}

  @Post()
  create(@Body() createDkycDto: CreateDkycDto) {
    return this.dkycService.create(createDkycDto);
  }
}
