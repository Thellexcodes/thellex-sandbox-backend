import { Injectable } from '@nestjs/common';
import { AbstractFiatwalletService } from './abstracts/abstract.fiatwalletService';

@Injectable()
export class FiatwalletService extends AbstractFiatwalletService {
  createFiatWalletProfile(userId: string, payload: any): Promise<any> {
    return null;
  }

  createFiatWallet(userId: string, payload: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletProfile(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletByCountry(userId: string, country: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserFiatWalletByTicker(userId: string, ticker: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getAllFiatWallets(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  suspendFiatWallet(walletId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  suspendFiatWallets(walletIds: string[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
