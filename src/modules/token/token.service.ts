import { HttpStatus, Injectable } from '@nestjs/common';
import { TokenManager, Token } from '@/thellex-sdk-v1/src';
import { CustomHttpException } from '@/middleware/custom.http.exception';

@Injectable()
export class TokenService {
  findAll(chainId: number): Token[] {
    try {
      const tokenManager = TokenManager.getInstance();
      const tokens = tokenManager.getTokens(chainId);
      return tokens;
    } catch (err) {
      throw new CustomHttpException(err, HttpStatus.NOT_FOUND);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} token`;
  }

  remove(id: number) {
    return `This action removes a #${id} token`;
  }
}
