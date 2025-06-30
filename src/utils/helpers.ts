import { RateDto } from '@/modules/aggregators/swap/dto/rate.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { Token } from '@uniswap/sdk-core';
import { Repository } from 'typeorm';
import { UserEntity } from './typeorm/entities/user.entity';
import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import * as crypto from 'crypto';
import { ENV_TESTNET } from '@/models/settings.types';
import { getAppConfig, getEnv } from '@/constants/env';
import { walletConfig } from './tokenChains';
import {
  thellexTiers,
  TierEnum,
  tierOrder,
  TxnTypeEnum,
} from '@/config/tier.lists';
import { TierInfoDto } from '@/modules/users/dto/tier-info.dto';

//TODO: handle errors with enums

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
  result: unknown | any,
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

function generateRandomUid(): number {
  return Math.floor(10000000 + Math.random() * 90000000);
}

export async function generateUniqueUid(
  userRepository: Repository<UserEntity>,
): Promise<number> {
  let uid: number;
  let exists = true;

  while (exists) {
    uid = generateRandomUid();
    const existingUser = await userRepository.findOne({ where: { uid } });
    exists = !!existingUser;
  }

  return uid;
}

/**
 * Returns a UTC Date object that is `monthsToAdd` months ahead of the current UTC date/time.
 * @param monthsToAdd Number of months to add
 * @returns Date in UTC
 */
export function getUtcExpiryDateMonthsFromNow(monthsToAdd: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + monthsToAdd,
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds(),
    ),
  );
}

export function calculateNameMatchScore(
  input: string,
  recordName: string,
): number {
  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  const inputNorm = normalize(input);
  const recordNorm = normalize(recordName);
  const matches = [...inputNorm].filter((c) => recordNorm.includes(c));
  return matches.length / inputNorm.length;
}

export function generateYcSignature({
  method,
  path,
  publicKey,
  secretKey,
  body,
}: IGenerateYCSignature) {
  const timestamp = new Date().toISOString();
  let bodyHash = '';

  if (method === 'POST' || method === 'PUT') {
    const rawBody =
      typeof body === 'string' ? body : JSON.stringify(body || {});
    const hash = crypto.createHash('sha256').update(rawBody).digest();
    bodyHash = hash.toString('base64');
  }

  const message = `${timestamp}${path}${method.toUpperCase()}${bodyHash}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');

  return {
    headers: {
      Authorization: `YcHmacV1 ${publicKey}:${signature}`,
      'X-YC-Timestamp': timestamp,
    },
  };
}

/**
 * Generate a random AES-256 encryption key as a hex string
 * @returns {string} 64-character hex key string
 */
export function generateAes256Key(): string {
  const keyBuffer = crypto.randomBytes(32); // 32 bytes = 256 bits
  return keyBuffer.toString('hex'); // convert to hex string
}

export function toUTCDate(dateString: string): Date {
  if (!dateString) {
    // Return current UTC date/time
    return new Date(new Date().toISOString());
  }
  if (!dateString.endsWith('Z')) {
    dateString += 'Z';
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date(new Date().toISOString()) : date;
}

export function isSupportedBlockchainToken(
  network: SupportedBlockchainType,
  token: TokenEnum,
): boolean {
  for (const walletTypeKey in walletConfig) {
    const walletType = walletConfig[walletTypeKey as SupportedWalletTypes];
    for (const providerKey in walletType.providers) {
      const provider = walletType.providers[providerKey as WalletProviderEnum];
      for (const networkKey in provider.networks) {
        if (networkKey.toLowerCase() === network.toLowerCase()) {
          const supportedTokens =
            provider.networks[networkKey as SupportedBlockchainType].tokens;
          if (
            supportedTokens
              .map((t) => t.toLowerCase())
              .includes(token.toLowerCase())
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Dynamically retrieves the token ID from walletConfig based on token and chain.
 */
export function getTokenId({
  token,
  chain,
  isTestnet = false,
}: {
  token: TokenEnum;
  chain?: SupportedBlockchainType;
  isTestnet?: boolean;
}): string | undefined {
  for (const walletTypeKey in walletConfig) {
    const walletType = walletConfig[walletTypeKey as SupportedWalletTypes];
    const providers = walletType.providers;

    for (const providerKey in providers) {
      const provider = providers[providerKey as WalletProviderEnum];
      const networks = provider.networks;

      for (const networkKey in networks) {
        const network = networkKey as SupportedBlockchainType;
        const config = networks[network];

        // Check for mainnet/testnet match
        const matchesNetwork = chain
          ? chain === network
          : config.mainnet !== isTestnet;

        if (matchesNetwork && config.tokenIds?.[token]) {
          return config.tokenIds[token];
        }
      }
    }
  }

  return undefined;
}

export function formatTier(tierKey: TierEnum): TierInfoDto {
  const data = thellexTiers[tierKey];
  const withdrawalFee = data.txnFee?.[TxnTypeEnum.WITHDRAWAL];

  return {
    name: data.name,
    target: data.target,
    description: data.description,
    transactionLimits: data.transactionLimits,
    txnFee: withdrawalFee
      ? {
          [TxnTypeEnum.WITHDRAWAL]: {
            min: withdrawalFee.min,
            max: withdrawalFee.max,
            feePercentage: withdrawalFee.feePercentage,
          },
        }
      : {},
    requirements: data.requirements,
  };
}

export function formatUserWithTiers(user: UserEntity) {
  const userTier = user.tier || TierEnum.NONE;
  const currentIndex = tierOrder.indexOf(userTier);
  const nextTier =
    currentIndex + 1 < tierOrder.length ? tierOrder[currentIndex + 1] : null;

  return {
    ...user,
    currentTier: formatTier(userTier),
    nextTier: nextTier ? formatTier(nextTier) : null,
  };
}
