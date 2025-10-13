import { Body, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { AbstractFiatwalletController } from './abstracts/abstract.fiatwalletController';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { FiatEndpoints } from '@/routes/fiat-endpoints';
import { responseHandler } from '@/utils/helpers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';
import { VerificationAuthGuard } from '@/middleware/guards/local.auth.guard';
import { CreateFiatWalletDto } from './dto/fiatwallet.dto';

@ApiTags('Fiat Wallet')
@ApiBearerAuth('access-token')
@UseGuards(ClientAuthGuard)
@VersionedControllerV2(FiatEndpoints.MAIN)
export class FiatwalletController extends AbstractFiatwalletController {
  constructor(readonly fiatwalletService: FiatwalletService) {
    super(fiatwalletService);
  }

  @Post(FiatEndpoints.CREATE_PROFILE)
  @UseGuards(VerificationAuthGuard)
  async createFiatWalletProfile(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = await this.fiatwalletService.createProfileWithWallet(
      user.id,
    );
    responseHandler(result, res, req);
  }

  @Post(FiatEndpoints.CREATE_WALLET)
  @UseGuards(VerificationAuthGuard)
  async createFiatWallet(
    @Body() body: CreateFiatWalletDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = await this.fiatwalletService.addWalletToProfileWithBvn(
      user.id,
      body.bvn,
      body.dob,
    );
    responseHandler(result, res, req);
  }

  @Post(FiatEndpoints.GET_WALLET)
  async getUserFiatWalletProfile(
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = this.fiatwalletService.getUserFiatWalletProfile(user.id);
    responseHandler(result, res, req);
  }

  @Post(FiatEndpoints.GET_BY_COUNTRY)
  getUserFiatWalletByCountry(
    userId: string,
    country: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  @Post(FiatEndpoints.GET_BY_TICKER)
  getUserFiatWalletByTicker(
    userId: string,
    ticker: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  @Post(FiatEndpoints.GET_ALL)
  getAllFiatWallets(req: CustomRequest, res: CustomResponse): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
