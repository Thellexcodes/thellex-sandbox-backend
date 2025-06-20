import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import axios from 'axios';
import { CustomRequest } from '@/models/request.types';

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
export class GeoLocationMiddleware implements NestMiddleware {
  async use(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const forwarded = req.headers['x-forwarded-for'];
      const ip =
        typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : req.socket.remoteAddress;

      if (!ip) return next();

      const token = process.env.IPINFO_TOKEN;
      const url = `https://ipinfo.io/${ip}/json${token ? `?token=${token}` : ''}`;
      const { data } = await axios.get(url);

      const country = data.country;
      let continent = data.continent || null;

      if (!continent && country) {
        continent = AFRICAN_COUNTRY_CODES.includes(country) ? 'AF' : 'OTHER';
      }

      req.geoLocation = {
        ip,
        country,
        continent,
        isAfrica: continent === 'AF',
      };

      next();
    } catch (error) {
      req.geoLocation = undefined;
      next();
    }
  }
}
