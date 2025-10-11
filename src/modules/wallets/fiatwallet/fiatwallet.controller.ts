import { Controller } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { AbstractFiatwalletController } from './abstracts/abstract.fiatwalletController';
import { CustomRequest, CustomResponse } from '@/models/request.types';

@Controller('fiatwallet')
export class FiatwalletController extends AbstractFiatwalletController {
  constructor(readonly fiatwalletService: FiatwalletService) {
    super(fiatwalletService);
  }

  createFiatWalletProfile(
    body: any,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  createFiatWallet(
    body: any,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getUserFiatWalletProfile(
    userId: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getUserFiatWalletByCountry(
    userId: string,
    country: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getUserFiatWalletByTicker(
    userId: string,
    ticker: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getAllFiatWallets(req: CustomRequest, res: CustomResponse): Promise<void> {
    throw new Error('Method not implemented.');
  }
  suspendFiatWallet(
    walletId: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;
  suspendFiatWallet(
    body: { walletIds: string[] },
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;
  suspendFiatWallet(body: unknown, req: unknown, res: unknown): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
