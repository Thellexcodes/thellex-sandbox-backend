import { Post } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { AbstractFiatwalletController } from './abstracts/abstract.fiatwalletController';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { FiatEndpoints } from '@/routes/fiat-endpoints';
import { responseHandler } from '@/utils/helpers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags(FiatEndpoints.MAIN)
@ApiBearerAuth('access-token')
@VersionedControllerV2(FiatEndpoints.MAIN)
export class FiatwalletController extends AbstractFiatwalletController {
  constructor(readonly fiatwalletService: FiatwalletService) {
    super(fiatwalletService);
  }

  @Post(FiatEndpoints.CREATE_WALLET)
  async createFiatWallet(
    body: any,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = this.fiatwalletService.startCreateWalletJob(user.id, body);
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

  @Post(FiatEndpoints.STOP_ALL_JOBS)
  stopAll() {
    this.fiatwalletService.stopAllJobs();
    return { message: 'All crons stopped' };
  }
}
