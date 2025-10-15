import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { WalletEndpoints } from '@/routes/wallet-endpoints';
import { AbstractWalletManagerController } from '../abstract/abstract.wallet-manager.controller';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { QwalletService } from '../../qwallet/qwallet.service';
import { Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { WalletManagerQueryDto } from '@/models/wallet-manager.types';
import { WalletManagerServiceV2 } from './v2.wallet-manager.service';
import { BasicAuthGuard } from '@/middleware/guards/local.auth.guard';
import {
  WalletBalanceSummaryV2ResponseDto,
  WalletEntryDto,
} from '../dto/get-balance-response.dto';

@ApiTags('Wallet Manager V2')
@ApiBearerAuth('access-token')
@UseGuards(BasicAuthGuard)
@VersionedControllerV2(WalletEndpoints.MAIN)
export class WalletManagerControllerV2 extends AbstractWalletManagerController {
  constructor(
    private qwalletService: QwalletService,
    private v2WalletManagerService: WalletManagerServiceV2,
  ) {
    super();
  }

  @ApiOkResponse({ type: WalletBalanceSummaryV2ResponseDto })
  @Get(WalletEndpoints.BALANCE)
  @ApiExtraModels(WalletEntryDto)
  @Get('balance')
  async getBalance(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: WalletManagerQueryDto,
  ) {
    const user = req.user;
    if (query.action === 'activate' && !user.qWalletProfile) {
      await this.qwalletService.ensureUserHasProfileAndWallets(req.user);
    }
    const result = await this.v2WalletManagerService.getBalance(user);
    responseHandler(result, res, req);
  }
}
