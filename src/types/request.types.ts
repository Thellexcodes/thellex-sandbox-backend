import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Response } from 'express';
import { WalletType } from './wallet-manager.types';
import { IQWallet } from './qwallet.types';
import { TokenEnum } from '@/config/settings';

interface UserSession {
  id: string;
  cookie: Cookie;
}

interface Cookie {
  path: string;
  _expires: Date;
  originalMaxAge: number;
  httpOnly: boolean;
}

export interface CustomRequest extends Request {
  user?: UserEntity;
  sessionId?: string;
  session?: UserSession;
  walletType?: WalletType;
}

export interface CustomResponse extends Response {}

export interface CryptoQueryParams {
  id: string;
  symbol?: string;
  name?: string;
  address?: string;
  currentPrice?: string;
  priceChangePercentage24h?: string;
  marketCap?: string;
  image?: string;
}

// --- Payment Types ---
export enum PaymentType {
  REQUEST_FIAT,
  WITHDRAW_FIAT,
  REQUEST_CRYPTO,
}

export type RequestCryptoPaymentResponse = {
  wallet: IQWallet | null;
  assetCode: TokenEnum;
};
