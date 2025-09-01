import { Post, Body, Res, Req } from '@nestjs/common';
import { CrashReportService } from './crash-report.service';
import { CreateCrashReportDto } from './dto/create-crash-report.dto';
import { CustomRequest, CustomResponse } from '@/v1/models/request.types';
import { responseHandler } from '@/v1/utils/helpers';
import { VersionedController101 } from '@/v1/modules/controller/base.controller';
import { ApiBody } from '@nestjs/swagger';

@VersionedController101('crash-report')
export class CrashReportController {
  constructor(private readonly crashReportService: CrashReportService) {}

  @Post()
  @ApiBody({
    type: CreateCrashReportDto,
    description:
      'Submit a crash report with device details, OS info, and stack trace log. Used for debugging and monitoring application stability.',
  })
  async create(
    @Body() createCrashReportDto: CreateCrashReportDto,
    @Res() res: CustomResponse,
    @Req() req: CustomRequest,
  ) {
    await this.crashReportService.create(createCrashReportDto);
    responseHandler('', res, req);
  }
}
