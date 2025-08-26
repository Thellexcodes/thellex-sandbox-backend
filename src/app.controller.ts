import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { VersionedController101 } from './modules/controller/base.controller';
import { CustomRequest, CustomResponse } from './models/request.types';
import { responseHandler } from './utils/helpers';
// import { ClientAuthGuard } from './middleware/guards/signature.guard';
import * as fs from 'fs';
import * as path from 'path';

class BackendErrorDto {
  screen: string;
  errorType: string;
  message: string;
  code?: string;
  timestamp: number;
}

// @ApiExcludeController()
@VersionedController101('')
@Controller('')
// @UseGuards(ClientAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const response = this.appService.getHello();
    responseHandler(response, res, req);
  }

  @Post('/beta/subscribe')
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

  @Post('/error-report')
  reportError(@Body() body: BackendErrorDto) {
    try {
      // Add a timestamp if not provided
      const timestamp = body.timestamp || Date.now();
      const logFileName = `error-${timestamp}.json`;

      const logFolder = path.join(process.cwd(), 'api-error-logs');
      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true });
      }

      const filePath = path.join(logFolder, logFileName);

      // Write the error as JSON
      fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');

      console.log(`Error saved to file: ${filePath}`);
    } catch (err) {
      console.error('Failed to save error:', err);
    }
  }
}
