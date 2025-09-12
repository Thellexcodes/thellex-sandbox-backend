import { Body, Controller, Post } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionCheckDto } from './dto/version.dto';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Post('check')
  checkVersion(@Body() dto: VersionCheckDto) {
    return this.versionService.checkVersion(dto.platform, dto.currentVersion);
  }
}
