import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { ITokenQuery } from '@/types/request.types';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async findOneBySymbol(params: ITokenQuery): Promise<TokenEntity> {
    try {
      const query = this.tokenRepo
        .createQueryBuilder('token')
        .where('token.symbol = :symbol', { symbol: params.assetCode });

      if (params.network) {
        // Check if 'networks' contains the network - works for Postgres JSONB or array column
        query.andWhere(':network = ANY(token.networks)', {
          network: params.network,
        });
      }

      const token = await query.getOne();

      if (!token) {
        throw new CustomHttpException(
          `Token not found for symbol ${params.assetCode} and network ${params.network}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return token;
    } catch (err) {
      throw new CustomHttpException(err.message || err, HttpStatus.NOT_FOUND);
    }
  }
}
