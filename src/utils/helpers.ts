import { RateDto } from '@/modules/aggregators/swap/dto/rate.dto';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { Token } from '@uniswap/sdk-core';
import { Repository } from 'typeorm';
import { UserEntity } from './typeorm/entities/user.entity';
import {
  ALL_KNOWN_BLOCKCHAINS,
  ChainTokens,
  MAINNET_CHAINS,
  OPTIONAL_BLOCKCHAINS,
  SupportedBlockchainType,
  TESTNET_CHAINS,
  TokenEnum,
  tokenIds,
} from '@/config/settings';
import { ENV_TESTNET } from '@/constants/env';
import * as crypto from 'crypto';

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

export function getSupportedAssets() {
  const assets: { token: TokenEnum; network: keyof typeof ChainTokens }[] = [];

  for (const network in ChainTokens) {
    const tokens = ChainTokens[network as keyof typeof ChainTokens];
    for (const token of tokens) {
      assets.push({ token, network: network as keyof typeof ChainTokens });
    }
  }

  return assets;
}

export function isSupportedBlockchainToken(
  network: SupportedBlockchainType,
  token: TokenEnum,
): boolean {
  const tokens = ChainTokens[network];
  return tokens?.includes(token) ?? false;
}

export function isSupportedBlockchainType(
  value: string,
): value is SupportedBlockchainType {
  return Object.values(SupportedBlockchainType).includes(
    value as SupportedBlockchainType,
  );
}

export function normalizeBlockchains(
  blockchains: SupportedBlockchainType[],
): any[] {
  return blockchains.map((bc) => {
    switch (bc.toLowerCase()) {
      case SupportedBlockchainType.MATIC:
        return process.env.NODE_ENV === ENV_TESTNET ? 'MATIC-AMOY' : 'MATIC';
      default:
        throw new Error(`Unsupported blockchain type: ${bc}`);
    }
  });
}

export const cWalletNetworkNameGetter = (
  network: SupportedBlockchainType,
): string =>
  network === SupportedBlockchainType.MATIC &&
  process.env.NODE_ENV === ENV_TESTNET
    ? 'MATIC-AMOY'
    : 'MATIC';

export function yellowCardAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.YELLOWCARD_AUTH_KEY}`,
  };
}

export function getTokenId({
  token,
  chain,
  isTestnet = false,
}: {
  token: TokenEnum;
  chain?: SupportedBlockchainType;
  isTestnet?: boolean;
}): string | undefined {
  // If chain provided, use it directly
  if (chain) {
    return tokenIds[token]?.[chain];
  }

  // Otherwise pick first chain from mainnet or testnet arrays
  const chains = isTestnet ? TESTNET_CHAINS[token] : MAINNET_CHAINS[token];
  if (!chains || chains.length === 0) return undefined;

  for (const c of chains) {
    const id = tokenIds[token]?.[c];
    if (id) return id;
  }

  return undefined;
}

// --- Utility functions ---
export const isChainSupported = (chain: SupportedBlockchainType): boolean =>
  ALL_KNOWN_BLOCKCHAINS.includes(chain);

export const isChainOptional = (chain: SupportedBlockchainType): boolean =>
  OPTIONAL_BLOCKCHAINS.includes(chain);

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

export function getTokensForNetworks(
  networks: SupportedBlockchainType[],
): TokenEnum[] {
  const tokensSet = new Set<TokenEnum>();
  networks.forEach((network) => {
    const tokens = ChainTokens[network];
    if (tokens) {
      tokens.forEach((token) => tokensSet.add(token));
    }
  });
  return Array.from(tokensSet);
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
