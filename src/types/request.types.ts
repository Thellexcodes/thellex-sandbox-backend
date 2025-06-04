import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Response } from 'express';
import { QWallet } from './qwallet.types';
import { Token } from '@/config/settings';

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
  wallet: QWallet | null;
  assetCode: Token;
};
