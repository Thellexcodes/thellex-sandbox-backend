import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { VersionedController101 } from './modules/controller/base.controller';
import { CustomRequest, CustomResponse } from './models/request.types';
import { responseHandler } from './utils/helpers';
import { ClientAuthGuard } from './middleware/guards/client-auth.guard';
import { BaseEndpoints } from './routes/base-endpoints';
import { ApiTags } from '@nestjs/swagger';
import { AppVersionDto, CheckAppVersionDto } from './models/base/app.type';
import { APP_VERSIONS } from './config/settings';

@ApiTags('Base V1')
@VersionedController101(BaseEndpoints.MAIN)
@UseGuards(ClientAuthGuard)
export class AppController {
  protected readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const response = this.appService.getHello();
    responseHandler(response, res, req);
  }

  @Post(BaseEndpoints.SUBSCRIBE)
  async subscribeBeta(
    @Body() createSubscribeBetaDto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response = await this.appService.subscribeToBeta(
      createSubscribeBetaDto,
    );
    responseHandler(response, res, req);
  }

  @Get(BaseEndpoints.CHECK_APP_VERSION)
  async getAppVersion(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: CheckAppVersionDto,
  ) {
    const { platform, currentVersion } = query;

    // Get platform versions (array of releases)
    const platformVersions = APP_VERSIONS[platform as keyof AppVersionDto];

    // Validate platform support
    if (!platformVersions || platformVersions.length === 0) {
      return responseHandler(
        { message: `No versions found for platform: ${platform}` },
        res,
        req,
      );
    }

    // Get the latest release (last entry)
    const latestVersionInfo = platformVersions[platformVersions.length - 1];

    // Compare versions — simple semantic comparison
    const isOutdated = this.isVersionOutdated(
      currentVersion,
      latestVersionInfo.latestVersion,
    );

    // If outdated, return update info
    if (isOutdated) {
      return responseHandler(latestVersionInfo, res, req);
    }

    // If up to date, return 204 No Content (no update needed)
    return responseHandler('', res, req);
  }

  /**
   * Compare semantic versions (e.g., "1.2.3" < "1.3.0")
   */
  private isVersionOutdated(current: string, latest: string): boolean {
    const parse = (v: string) => v.split('.').map(Number);
    const [cMajor, cMinor, cPatch] = parse(current);
    const [lMajor, lMinor, lPatch] = parse(latest);

    if (cMajor < lMajor) return true;
    if (cMajor === lMajor && cMinor < lMinor) return true;
    if (cMajor === lMajor && cMinor === lMinor && cPatch < lPatch) return true;
    return false;
  }
}
