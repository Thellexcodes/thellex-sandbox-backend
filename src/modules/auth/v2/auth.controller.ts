import { Body, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthnService } from './auth.service';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { responseHandler } from '@/utils/helpers';
import {} from '@/middleware/guards/local.auth.guard';
import { VerifyRegistrationDto } from '../dto/verify-registeration.dto';
import { VerifyAuthenticationDto } from '../dto/verify-auth.dto';
import { VersionedControllerV2 } from '../../controller/base.controller';
import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';
import { AuthEndpoints } from '@/routes/auth-endpoints';
import { AbstractAuthController } from '../abstracts/AbstractAuthController';

@ApiTags('Auth V1')
@ApiBearerAuth('access-token')
@VersionedControllerV2(AuthEndpoints.MAIN)
@UseGuards(ClientAuthGuard)
export class AuthController extends AbstractAuthController {
  constructor(private readonly authNService: AuthnService) {
    super();
  }

  @Post(AuthEndpoints.REGISTER_OPTIONS)
  @ApiBody({ description: 'Create user challenge' })
  async create(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const publicKeyCredentialCreationOptionsJSON =
      await this.authNService.createChallenge(req.user);
    responseHandler(publicKeyCredentialCreationOptionsJSON, res, req);
  }

  @Post(AuthEndpoints.VERIFY_REGISTRATION)
  @ApiBody({ description: 'Verify registration response' })
  async verifyChallenge(
    @Body() verifyRegistationDto: VerifyRegistrationDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const challenge = await this.authNService.verifyRegistration(
      req.user,
      verifyRegistationDto,
    );

    responseHandler(challenge, res, req);
  }

  @Post(AuthEndpoints.AUTH_OPTIONS)
  @ApiBody({ description: 'Start Authentication' })
  async authOptions(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const options = await this.authNService.authOptions(req.user);
    responseHandler(options, res, req);
  }

  @Post(AuthEndpoints.AUTHENTICATE)
  @ApiBody({ description: 'Verify Authentication' })
  async verifyAuth(
    @Body() body: VerifyAuthenticationDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const options = await this.authNService.authenticate(req.user, body);
    responseHandler(options, res, req);
  }
}
