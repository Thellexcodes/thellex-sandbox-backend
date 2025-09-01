import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthnService } from './auth.service';
import { CustomRequest, CustomResponse } from '@/v1/models/request.types';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { responseHandler } from '@/v1/utils/helpers';
import {} from '@/v1/middleware/guards/local.auth.guard';
import { VerifyRegistrationDto } from './dto/verify-registeration.dto';
import { VerifyAuthenticationDto } from './dto/verify-auth.dto';
import { VersionedController101 } from '../controller/base.controller';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@VersionedController101('auth')
export class AuthController {
  constructor(private readonly authNService: AuthnService) {}

  // @Post('/register-options')
  // @UseGuards(AuthGuard)
  // @ApiBody({ description: 'Create user challenge' })
  // async create(@Req() req: CustomRequest, @Res() res: CustomResponse) {
  //   const publicKeyCredentialCreationOptionsJSON =
  //     await this.authNService.createChallenge(req.user);
  //   responseHandler(publicKeyCredentialCreationOptionsJSON, res, req);
  // }

  // @Post('verify-registration')
  // @UseGuards(AuthGuard)
  // @ApiBody({ description: 'Verify registration response' })
  // async verifyChallenge(
  //   @Body() verifyRegistationDto: VerifyRegistrationDto,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ) {
  //   const challenge = await this.authNService.verifyRegistration(
  //     req.user,
  //     verifyRegistationDto,
  //   );

  //   responseHandler(challenge, res, req);
  // }

  // @Post('auth-options')
  // @UseGuards(AuthGuard)
  // @ApiBody({ description: 'Start Authentication' })
  // async authOptions(@Req() req: CustomRequest, @Res() res: CustomResponse) {
  //   const options = await this.authNService.authOptions(req.user);
  //   responseHandler(options, res, req);
  // }

  // @Post('authenticate')
  // @UseGuards(AuthGuard)
  // @ApiBody({ description: 'Verify Authentication' })
  // async verifyAuth(
  //   @Body() body: VerifyAuthenticationDto,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ) {
  //   // const options = await this.authNService.authenticate(req.user, body);
  //   // responseHandler(options, res, req);
  // }
}
