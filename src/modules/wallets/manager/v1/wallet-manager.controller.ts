import { Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { WalletManagerService } from './wallet-manager.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { VersionedController101 } from '@/modules/controller/base.controller';
import { BasicAuthGuard } from '@/middleware/guards/local.auth.guard';
import { QwalletService } from '../../qwallet/qwallet.service';
import { WalletManagerQueryDto } from '@/models/wallet-manager.types';
import {
  WalletBalanceSummaryV2ResponseDto,
  WalletEntryDto,
} from '../dto/get-balance-response.dto';

@ApiTags('Wallet Manager')
@ApiBearerAuth('access-token')
@VersionedController101('wallet-manager')
@UseGuards(BasicAuthGuard)
export class WalletManagerController {
  constructor(
    private readonly walletManagerService: WalletManagerService,
    private readonly qwalletService: QwalletService,
  ) {}

  @ApiOkResponse({ type: WalletBalanceSummaryV2ResponseDto })
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
    const result = await this.walletManagerService.getBalance(user);
    responseHandler(result, res, req);
  }
}
