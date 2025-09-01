import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { MpPaymentHooksService } from './mp-payment-hooks.service';
import { CreateMpPaymentHookDto } from './dto/create-mp-payment-hook.dto';
import { UpdateMpPaymentHookDto } from './dto/update-mp-payment-hook.dto';
import { ApiTags } from '@nestjs/swagger';
import { responseHandler } from '@/v1/utils/helpers';
import { CustomRequest, CustomResponse } from '@/v1/models/request.types';

@ApiTags('Web Hooks')
@Controller('mp-payment-hooks')
export class MpPaymentHooksController {
  constructor(private readonly mpPaymentHooksService: MpPaymentHooksService) {}

  @Post()
  // create(@Body() createMpPaymentHookDto: CreateMpPaymentHookDto) {
  create(@Body() createMpPaymentHookDto: any) {
    return this.mpPaymentHooksService.create(createMpPaymentHookDto);
  }

  @Get()
  findAll(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    return responseHandler('Hello world', res, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mpPaymentHooksService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMpPaymentHookDto: UpdateMpPaymentHookDto,
  ) {
    return this.mpPaymentHooksService.update(+id, updateMpPaymentHookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mpPaymentHooksService.remove(+id);
  }
}
