import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { CrashReportService } from './crash-report.service';
import { CreateCrashReportDto } from './dto/create-crash-report.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { VersionedController001 } from '@/modules/controller/base.controller';

@VersionedController001('crash-report')
export class CrashReportController {
  constructor(private readonly crashReportService: CrashReportService) {}

  @Post()
  async create(
    @Body() createCrashReportDto: any,
    @Res() res: CustomResponse,
    @Req() req: CustomRequest,
  ) {
    const result = await this.crashReportService.create(createCrashReportDto);
    responseHandler(result, res, req);
  }
}
