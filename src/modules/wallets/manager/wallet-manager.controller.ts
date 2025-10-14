import { Get, Post, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { WalletManagerService } from './wallet-manager.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import {
  WalletBalanceSummaryResponseDto,
  WalletMapDto,
} from './dto/get-balance-response.dto';
import { VersionedController101 } from '@/modules/controller/base.controller';
import { BasicAuthGuard } from '@/middleware/guards/local.auth.guard';
import { QwalletService } from '../qwallet/qwallet.service';

@ApiTags('Wallet Manager')
@ApiBearerAuth('access-token')
@UseGuards(BasicAuthGuard)
@VersionedController101('wallet-manager')
export class WalletManagerController {
  constructor(
    private readonly walletManagerService: WalletManagerService,
    private readonly qwalletService: QwalletService,
  ) {}

  // Get overall wallet balance across all assets
  @ApiExtraModels(WalletMapDto)
  @Get('balance')
  @ApiOkResponse({ type: WalletBalanceSummaryResponseDto })
  async getBalance(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: { action?: string },
  ) {
    const user = req.user;
    if (query.action === 'activate' && !user.qWalletProfile) {
      await this.qwalletService.ensureUserHasProfileAndWallets(req.user);
    }
    const result = await this.walletManagerService.getBalance(user);
    responseHandler(result, res, req);
  }
}
