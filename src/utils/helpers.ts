import { RateDto } from '@/modules/aggregators/swap/dto/rate.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { Token } from '@uniswap/sdk-core';
import { Repository } from 'typeorm';
import { IUserDto, UserEntity } from './typeorm/entities/user.entity';
import {
  BlockchainNetworkSettings,
  SUPPORTED_RAMP_COUNTRIES,
  SupportedBlockchainTypeEnum,
  SupportedWalletTypes,
  TokenEnum,
  TRANSACTION_POLICY,
  TRANSACTION_REQUIREMENTS,
  WalletProviderEnum,
} from '@/config/settings';
import * as crypto from 'crypto';
import { walletConfig } from './tokenChains';
import {
  thellexTiers,
  TierEnum,
  tierOrder,
  TxnTypeEnum,
} from '@/config/tier.lists';
import { TierInfoDto } from '@/modules/users/dto/tier-info.dto';
import { IdTypeEnum } from '@/models/kyc.types';
import { compareTwoStrings } from 'string-similarity';
import { Injectable, PipeTransform } from '@nestjs/common';
import { NGBankDto, NigeriaBanks } from './nigeria-banks';
import { getEnv } from '@/constants/env';
import { ENV_DEVELOPMENT, ENV_PRODUCTION } from '@/models/settings.types';
import { RequestCryptoOffRampPaymentDto } from '../modules/payments/dto/request-crypto-offramp-payment.dto';
import { createReadStream } from 'fs';
import { BaseResponseDto } from '@/models/base-response.dto';
import { Response } from 'express';
import { BaseFindArgs, dynamicQuery, findOneDynamic } from './DynamicSource';

//TODO: handle errors with enums

/**
 * Checks whether the given value is a valid number.
 *
 * This function works with both string and number inputs.
 * If the input is a string, non-digit characters are removed before the check.
 *
 * @param n - The value to check. Can be a string or a number.
 * @returns `true` if the cleaned value is a finite number, otherwise `false`.
 *
 * @example
 * isNumber(123);        // true
 * isNumber('456');      // true
 * isNumber('12.3abc');  // true
 * isNumber('abc');      // false
 */
export function isNumber(n: string | number): boolean {
  const cleanedValue = String(n).replace(/\D/g, '');
  return !isNaN(parseFloat(cleanedValue)) && isFinite(Number(cleanedValue));
}

export function isSessionNotExpired(expiredAt: string) {
  const expiredAtTimestamp = parseInt(expiredAt, 10);

  const currentTimestamp = new Date().getTime();

  return expiredAtTimestamp > currentTimestamp;
}

export function responseHandler<T>(
  result: T,
  res: Response,
  req: CustomRequest,
): Response<BaseResponseDto<T>> {
  const sessionId = req?.sessionId;
  const statusCode = res?.statusCode ?? 200;

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

export async function generateUniqueUid(email: string): Promise<number> {
  let uid: number;
  let exists = true;

  while (exists) {
    uid = generateRandomUid();
    const options = dynamicQuery<UserEntity>('findOne', {
      email,
      fields: 'uid',
    } as BaseFindArgs);
    const existingUser = await findOneDynamic(this.userRepository, options);
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

  if (['POST', 'PUT'].includes(method.toUpperCase())) {
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
  network: SupportedBlockchainTypeEnum,
  token: TokenEnum,
): boolean {
  for (const walletTypeKey in walletConfig) {
    const walletType = walletConfig[walletTypeKey as SupportedWalletTypes];
    for (const providerKey in walletType.providers) {
      const provider = walletType.providers[providerKey as WalletProviderEnum];
      for (const networkKey in provider.networks) {
        if (networkKey.toLowerCase() === network.toLowerCase()) {
          const supportedTokens =
            provider.networks[networkKey as SupportedBlockchainTypeEnum].tokens;
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
  chain?: SupportedBlockchainTypeEnum;
  isTestnet?: boolean;
}): string | undefined {
  for (const walletTypeKey in walletConfig) {
    const walletType = walletConfig[walletTypeKey as SupportedWalletTypes];
    const providers = walletType.providers;

    for (const providerKey in providers) {
      const provider = providers[providerKey as WalletProviderEnum];
      const networks = provider.networks;

      for (const networkKey in networks) {
        const network = networkKey as SupportedBlockchainTypeEnum;
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

export function formatUserWithTiers(user: UserEntity): Partial<IUserDto> {
  const userTier = user.tier || TierEnum.NONE;
  const currentIndex = tierOrder.indexOf(userTier);
  const nextTier =
    currentIndex + 1 < tierOrder.length ? tierOrder[currentIndex + 1] : null;

  const idTypes = user.kyc?.idTypes || [];
  const country = user.kyc?.country || '';
  const outstandingKyc: string[] = [];

  if (isCountrySupportedForOfframp(country) && !user.kyc.bvn) {
    outstandingKyc.push(IdTypeEnum.BVN);
  }

  const remainingTiers = tierOrder
    .slice(currentIndex + 1)
    .map((tierKey) => formatTier(tierKey));

  const result: Partial<IUserDto> = {
    ...user,
    currentTier: formatTier(userTier),
    nextTier: nextTier ? formatTier(nextTier) : null,
    outstandingKyc,
    remainingTiers,
    transactionSettings: TRANSACTION_POLICY,
  };

  if (isCountrySupportedForOfframp(country)) {
    result.banks = NigeriaBanks;
  }

  return result;
}

export function keyByFieldKey(array: any[]): Record<string, any> {
  return array.reduce((acc, item) => {
    if (item?.field_key) acc[item.field_key] = item;
    return acc;
  }, {});
}

export const normalize = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');

export const isCountrySupportedForOfframp = (
  country: string,
  threshold = 0.8,
): boolean => {
  const normalized = normalize(country);

  return SUPPORTED_RAMP_COUNTRIES.some((supported) => {
    const similarity = compareTwoStrings(normalize(supported), normalized);
    return similarity >= threshold;
  });
};

export function getTreasuryAddress(
  network: SupportedBlockchainTypeEnum,
): string {
  return BlockchainNetworkSettings[network].treasuryAddress;
}

export function normalizeEnumValue<T extends Record<string, string>>(
  value: string,
  enumObj: T,
): T[keyof T] {
  const normalize = (val: string) => val.toLowerCase().replace(/[_\s]/g, '');
  const normalizedInput = normalize(value);

  const match = Object.values(enumObj).find(
    (enumValue) => normalize(enumValue) === normalizedInput,
  );

  if (!match) {
    throw new Error(`Invalid enum value: ${value}`);
  }

  // Assert that match is of type T[keyof T]
  return match as T[keyof T];
}

export function toUTCString(timestamp: number): Date {
  return new Date(timestamp);
}

@Injectable()
export class NormalizeEnumPipe implements PipeTransform {
  constructor(private readonly enumType: Record<string, string>) {}

  transform(value: any) {
    if (typeof value === 'string') {
      return normalizeEnumValue(value, this.enumType);
    }
    return value;
  }
}

// Calculate Levenshtein distance for string similarity
function levenshteinDistance(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix: number[][] = Array.from({ length: lenB + 1 }, (_, j) =>
    Array.from({ length: lenA + 1 }, (_, i) => (j === 0 ? i : i === 0 ? j : 0)),
  );

  for (let j = 1; j <= lenB; j++) {
    for (let i = 1; i <= lenA; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost, // substitution
      );
    }
  }

  return matrix[lenB][lenA];
}

// Calculate similarity percentage
function similarityPercentage(a: string, b: string): number {
  if (!a || !b) return 0;

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100;
}

// Main fuzzy match function
export function findBankByName(name: string): NGBankDto | null {
  if (!name || typeof name !== 'string') return null;

  const cleanedName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const pattern = cleanedName.split(/\s+/).join('.*');
  const regex = new RegExp(pattern, 'i');

  const candidates = NigeriaBanks.filter((bank) => regex.test(bank.name));
  if (candidates.length === 0) return null;

  let bestMatch: NGBankDto | null = null;
  let highestSimilarity = 0;

  for (const bank of candidates) {
    const similarity = similarityPercentage(cleanedName, bank.name);
    if (similarity >= 95 && similarity > highestSimilarity) {
      bestMatch = bank;
      highestSimilarity = similarity;
    }
  }

  return bestMatch;
}

export function toNumber(val: string): number {
  return Number(val);
}

export function capitalizeName(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function toLowestDenomination(amount: number): number {
  return Math.round(amount * 100);
}

export function extractFirstName(firstName: string): string {
  if (!firstName || firstName.trim() === '') {
    return '';
  }
  return firstName.trim().split(' ')[0];
}

export async function getServerIp(): Promise<string> {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
}

export const isProd = getEnv() === ENV_PRODUCTION;
export const isDev = getEnv() === ENV_DEVELOPMENT;

export function validateOffRampRequest(
  request: RequestCryptoOffRampPaymentDto,
): {
  valid: boolean;
  reason?: string;
} {
  const requirement = TRANSACTION_REQUIREMENTS[request.assetCode.toUpperCase()];
  if (!requirement) {
    return { valid: false, reason: 'Unsupported asset' };
  }

  if (request.mainAssetAmount < requirement.minAmount) {
    return {
      valid: false,
      reason: `Minimum amount for ${request.assetCode.toUpperCase()} is ${requirement.minAmount}`,
    };
  }

  // (Optional) check maximum
  if (
    requirement.maxAmount &&
    request.mainAssetAmount > requirement.maxAmount
  ) {
    return {
      valid: false,
      reason: `Maximum amount for ${request.assetCode.toUpperCase()} is ${requirement.maxAmount}`,
    };
  }

  return { valid: true };
}

export function sha256File(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

export function flexiTruncate(value, maxLength) {
  if (value === null || value === undefined) return '';

  // If it's a number, handle decimals specially
  if (typeof value === 'number') {
    const str = String(value);

    // Check if it's a decimal
    if (str.includes('.')) {
      const [intPart, decPart] = str.split('.');
      const truncatedDec =
        decPart.length > maxLength
          ? decPart.slice(0, maxLength) + '…'
          : decPart;
      return intPart + '.' + truncatedDec;
    } else {
      // Integer number: just truncate like a string
      return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
    }
  }

  // For strings (and other types), just convert to string and truncate normally
  const str = String(value);
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}
