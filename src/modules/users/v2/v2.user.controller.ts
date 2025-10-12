import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { UserEndpoints } from '@/routes/user-endpoints';
import { VerifiedResponseDto, VerifyUserDto } from '../dto/verify-user.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { AbstractUserController } from '../abstracts/abstract-user.controller';
import { responseHandler } from '@/utils/helpers';
import { UserServiceV2 } from './v2.user.service';
import { Body, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';
import { VerificationAuthGuard } from '@/middleware/guards/local.auth.guard';

@ApiTags('User V2')
@UseGuards(ClientAuthGuard, VerificationAuthGuard)
@ApiBearerAuth('access-token')
@VersionedControllerV2(UserEndpoints.MAIN)
export class UserControllerV2 extends AbstractUserController {
  constructor(private userServiceV2: UserServiceV2) {
    super();
  }

  @Post('verify')
  @ApiOkResponse({ type: VerifiedResponseDto })
  async verify(
    @Body() verifyUserDto: VerifyUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = await this.userServiceV2.verifyUser(verifyUserDto, user);
    responseHandler(result, res, req);
  }
}
