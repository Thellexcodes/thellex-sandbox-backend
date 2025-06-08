import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { WalletType } from '@/types/wallet-manager.types';

const AFRICAN_COUNTRY_CODES = [
  'DZ',
  'AO',
  'BJ',
  'BW',
  'BF',
  'BI',
  'CM',
  'CV',
  'CF',
  'TD',
  'KM',
  'CD',
  'CG',
  'CI',
  'DJ',
  'EG',
  'GQ',
  'ER',
  'SZ',
  'ET',
  'GA',
  'GM',
  'GH',
  'GN',
  'GW',
  'KE',
  'LS',
  'LR',
  'LY',
  'MG',
  'MW',
  'ML',
  'MR',
  'MU',
  'MA',
  'MZ',
  'NA',
  'NE',
  'NG',
  'RW',
  'ST',
  'SN',
  'SC',
  'SL',
  'SO',
  'ZA',
  'SS',
  'SD',
  'TZ',
  'TG',
  'TN',
  'UG',
  'ZM',
  'ZW',
];

@Injectable()
export class GeoWalletMiddleware implements NestMiddleware {
  async use(
    req: Request & { walletType?: WalletType },
    res: Response,
    next: NextFunction,
  ) {
    try {
      const forwarded = req.headers['x-forwarded-for'];
      const ip =
        typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : req.socket.remoteAddress;

      if (!ip) {
        req.walletType = WalletType.CWALLET;
        return next();
      }

      const token = process.env.IPINFO_TOKEN;
      const url = `https://ipinfo.io/${ip}/json${token ? `?token=${token}` : ''}`;
      const { data } = await axios.get(url);

      let continent = data.continent;
      const country = data.country;

      if (!continent && country) {
        continent = AFRICAN_COUNTRY_CODES.includes(country) ? 'AF' : 'OTHER';
      }

      req.walletType =
        continent === 'AF' ? WalletType.QWALLET : WalletType.CWALLET;

      next();
    } catch (error) {
      req.walletType = WalletType.CWALLET;
      next();
    }
  }
}
