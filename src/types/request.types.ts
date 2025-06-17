import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Response } from 'express';
import { WalletType } from './wallet-manager.types';
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

export interface ITokenAsset {
  id?: string;
  assetCode?: string;
  name?: string;
  address?: string;
  network?: string;
  currentPrice?: string;
  priceChangePercentage24h?: string;
  marketCap?: string;
  image?: string;
}

export type RequestCryptoPaymentResponse = {
  wallet: any | null;
  assetCode: TokenEnum;
};

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}
