import { HttpStatus, Injectable } from '@nestjs/common';
import { TokenManager, Token } from '@/thellex-sdk-v1/src';
import { CustomHttpException } from '@/middleware/custom.http.exception';

@Injectable()
export class TokenService {
  async findAll(): Promise<any> {
    try {
      const priorityTokens = await TokenManager.getInstance().fetchTokens(true);
      return priorityTokens;
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
