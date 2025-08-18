import { Get, Post, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { WalletManagerService } from './wallet-manager.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import {
  WalletBalanceSummaryResponseDto,
  WalletMapDto,
} from './dto/get-balance-response.dto';
import { VersionedController101 } from '@/modules/controller/base.controller';

@ApiTags('Wallet Manager')
@ApiBearerAuth('access-token')
@VersionedController101('wallet-manager')
export class WalletManagerController {
  constructor(private readonly walletManagerService: WalletManagerService) {}

  // Get overall wallet balance across all assets
  @ApiExtraModels(WalletMapDto)
  @Get('balance')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: WalletBalanceSummaryResponseDto })
  async getBalance(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const user = req.user;
    const result = await this.walletManagerService.getBalance(user);
    responseHandler(result, res, req);
  }

  // Get balance for a single asset by asset identifier (e.g., token symbol, contract address)
  @Get('balance/:assetId')
  @UseGuards(AuthGuard)
  async getSingleAssetBalance(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Param('assetId') assetId: string,
  ) {
    const user = req.user;
    const result = await this.walletManagerService.getSingleAssetBalance(
      user,
      assetId,
    );

    responseHandler(result, res, req);
  }

  // Get detailed breakdown of assets held in wallet (tokens, coins, NFTs, etc.)
  @Get('assets')
  @UseGuards(AuthGuard)
  async getAssets(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const user = req.user;
    const result = await this.walletManagerService.getAssets(user.id);
    responseHandler(result, res, req);
  }

  // Get transaction history
  @Get('transactions')
  @UseGuards(AuthGuard)
  async getTransactionHistory(
    @Query('limit') limit: number = 20,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const userId = req.user.id;
    const result = await this.walletManagerService.getTransactionHistory(
      userId,
      limit,
    );
    responseHandler(result, res, req);
  }

  // Get the wallet addresses associated with the user across different chains
  @Get('addresses')
  @UseGuards(AuthGuard)
  async getWalletAddresses(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const userId = req.user.id;
    const result = await this.walletManagerService.getWalletAddresses(userId);
    responseHandler(result, res, req);
  }

  // Refresh or sync wallet state (e.g., fetch latest balances from chains)
  @Post('sync')
  @UseGuards(AuthGuard)
  async syncWallet(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const user = req.user;
    const result = await this.walletManagerService.syncWallet(user);
    responseHandler(result, res, req);
  }

  // Get rewards info (e.g., earned rewards, claimable rewards)
  @Get('rewards')
  @UseGuards(AuthGuard)
  async getRewards(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const userId = req.user.id;
    const result = await this.walletManagerService.getRewards(userId);
    responseHandler(result, res, req);
  }
}
