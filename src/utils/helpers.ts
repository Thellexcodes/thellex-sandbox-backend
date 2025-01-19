import { RateDto } from '@/modules/aggregators/swap/dto/rate.dto';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { Token } from '@uniswap/sdk-core';

export function isNumber(n: string | number): boolean {
  const cleanedValue = String(n).replace(/\D/g, '');

  return !isNaN(parseFloat(cleanedValue)) && isFinite(Number(cleanedValue));
}

export function isSessionNotExpired(expiredAt: string) {
  const expiredAtTimestamp = parseInt(expiredAt, 10);

  const currentTimestamp = new Date().getTime();

  return expiredAtTimestamp > currentTimestamp;
}

export function responseHandler(
  result: unknown,
  res: CustomResponse,
  req: CustomRequest,
) {
  const sessionId = req?.sessionId;
  const statusCode = res?.statusCode;

  return res.status(statusCode).send({
    result,
    status: true,
    sessionId,
    path: req.url,
    statusCode,
  });
}

export async function createTokensFromQueryParams(
  queryParams: RateDto,
): Promise<Token[]> {
  const { chainId, payToken, receiveToken } = queryParams;

  const payTokenInstance = new Token(
    Number(chainId),
    payToken.address,
    Number(payToken.decimals),
    payToken.symbol,
    payToken.name,
  );

  const receiveTokenInstance = new Token(
    Number(chainId),
    receiveToken.address,
    Number(receiveToken.decimals),
    receiveToken.symbol,
    receiveToken.name,
  );

  return [payTokenInstance, receiveTokenInstance];
}
