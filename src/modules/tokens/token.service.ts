import { HttpStatus, Injectable } from '@nestjs/common';
// import { TokenManager, Token } from '@/thellex-sdk/src';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { CryptoQueryParams } from '@/types/request.types';

@Injectable()
export class TokenService {
  async findAll(): Promise<any> {
    try {
      // const priorityTokens = await TokenManager.getInstance().fetchTokens(true);
      // return priorityTokens;
    } catch (err) {
      throw new CustomHttpException(err, HttpStatus.NOT_FOUND);
    }
  }

  async findOne(cryptoQueryParams: CryptoQueryParams): Promise<any> {
    try {
      // const historyData =
      //   await TokenManager.getInstance().coinHistoricalChartData({
      //     startDate: `1711929600`,
      //     endDate: `1712275200`,
      //     id: cryptoQueryParams.id,
      //   });
      // return historyData;
    } catch (err) {
      throw new CustomHttpException(err, HttpStatus.NOT_FOUND);
    }
  }
}
