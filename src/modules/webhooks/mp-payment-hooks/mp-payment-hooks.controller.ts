import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { MpPaymentHooksService } from './mp-payment-hooks.service';
import {
  CreateMpPaymentHookDto,
  MpPaymentStatus,
} from './dto/create-mp-payment-hook.dto';
import { ApiTags } from '@nestjs/swagger';
import { normalizeEnumValue, responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';

@ApiTags('Web Hooks')
@Controller('mp-payment-hooks')
export class MpPaymentHooksController {
  constructor(private readonly mpPaymentHooksService: MpPaymentHooksService) {}

  @Post()
  async create(
    @Body() createMpPaymentHookDto: CreateMpPaymentHookDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const status = normalizeEnumValue(
      createMpPaymentHookDto.status,
      MpPaymentStatus,
    );

    switch (status) {
      case MpPaymentStatus.SUCCESS:
        await this.mpPaymentHooksService.success(createMpPaymentHookDto);
        break;
      default:
        return responseHandler('', res, req);
    }
  }
}
