import {
  Post,
  Body,
  Req,
  Res,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { VersionedController101 } from '../controller/base.controller';
import { responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { LightAuthGuard } from '@/middleware/guards/local.auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Devices')
@VersionedController101('devices')
@ApiBearerAuth('access-token')
@UseGuards(LightAuthGuard)
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name);

  constructor(private readonly devicesService: DevicesService) {}

  @Post('save-info')
  async saveFcmToken(
    @Body() createDeviceDto: CreateDeviceDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const response = await this.devicesService.saveFcmToken(
      user,
      createDeviceDto,
    );
    responseHandler(response, res, req);
  }

  @Delete('devices/:token')
  async removeFcmToken(
    @Body() request: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const response = await this.devicesService.removeFcmToken(
      request.userId,
      request.deviceId,
    );
    responseHandler(response, res, req);
  }
}
