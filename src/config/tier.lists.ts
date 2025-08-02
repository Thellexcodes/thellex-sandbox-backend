import { UserRequirement } from '../models/user.requirements.enum';

export enum TierEnum {
  NONE = 'none',
  BASIC = 'basic',
  PERSONAL = 'personal',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

export type TransactionLimits = {
  dailyCreditLimit: number;
  dailyDebitLimit: number;
  singleDebitLimit: number;
};

export const tierOrder = [
  TierEnum.NONE,
  TierEnum.BASIC,
  TierEnum.PERSONAL,
  TierEnum.PROFESSIONAL,
  TierEnum.BUSINESS,
  TierEnum.ENTERPRISE,
];

export enum TxnTypeEnum {
  FIAT_TO_FIAT = 'fiat-to-fiat',
  CRYPTO_TO_FIAT = 'crypto-to-fiat',
  FIAT_TO_CRYPTO = 'fiat-to-crypto',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
}

type TxnFeeDetails = {
  min: number;
  max?: number;
  feePercentage: number;
};

type TxnFeeMap = {
  [TxnTypeEnum.WITHDRAWAL]: TxnFeeDetails;
};

type Tier = {
  name: TierEnum;
  target: string;
  description: string;
  requirements: UserRequirement[];
  transactionLimits: TransactionLimits;
  txnFee?: TxnFeeMap;
};

export const thellexTiers: Partial<Record<TierEnum, Tier>> = {
  [TierEnum.BASIC]: {
    name: TierEnum.BASIC,
    target: 'First-Time Users',
    description: 'Users verified with NIN and BVN.',
    requirements: [
      UserRequirement.IDType,
      UserRequirement.AdditionalIDType,
      UserRequirement.FirstName,
      UserRequirement.MiddleName,
      UserRequirement.LastName,
      UserRequirement.PhoneNumber,
      UserRequirement.DateOfBirth,
      UserRequirement.NIN,
      UserRequirement.BVN,
      // UserRequirement.HouseNumber,
      // UserRequirement.StreetName,
      // UserRequirement.State,
      // UserRequirement.LGA,
    ],
    transactionLimits: {
      dailyCreditLimit: null,
      dailyDebitLimit: 900_000,
      singleDebitLimit: 100_000,
    },
    txnFee: {
      [TxnTypeEnum.WITHDRAWAL]: {
        min: 100,
        max: 150,
        feePercentage: 200,
      },
    },
  },
  [TierEnum.PERSONAL]: {
    name: TierEnum.PERSONAL,
    target: 'Verified Individuals',
    description:
      'Users with face and address verification — ideal for POS/crypto usage.',
    requirements: [
      UserRequirement.FaceVerification,
      UserRequirement.ResidentialAddress,
    ],
    transactionLimits: {
      dailyCreditLimit: null,
      dailyDebitLimit: 4_000_000,
      singleDebitLimit: 1_000_000,
    },
    txnFee: {
      [TxnTypeEnum.WITHDRAWAL]: {
        min: 1,
        max: 300,
        feePercentage: 2.0,
      },
    },
  },
  [TierEnum.PROFESSIONAL]: {
    name: TierEnum.PROFESSIONAL,
    target: 'Crypto-Savvy Professionals',
    description: 'Ideal for high-frequency users like traders and investors.',
    requirements: [
      UserRequirement.ResidentialAddressVerification,
      UserRequirement.SignedIndemnityForm,
    ],
    transactionLimits: {
      dailyCreditLimit: 1_000_000,
      dailyDebitLimit: 1_000_000,
      singleDebitLimit: 500_000,
    },
    txnFee: {
      [TxnTypeEnum.WITHDRAWAL]: {
        min: 1,
        max: 300,
        feePercentage: 2.0,
      },
    },
  },
  [TierEnum.BUSINESS]: {
    name: TierEnum.BUSINESS,
    target: 'SMEs & Startups',
    description: 'Registered CAC businesses with consistent volume.',
    requirements: [
      UserRequirement.CACCertificate,
      UserRequirement.BusinessVerificationDocs,
      UserRequirement.BusinessNameReview,
      UserRequirement.Attestation,
    ],
    transactionLimits: {
      dailyCreditLimit: 3_000_000,
      dailyDebitLimit: 3_000_000,
      singleDebitLimit: 1_000_000,
    },
    txnFee: {
      [TxnTypeEnum.WITHDRAWAL]: {
        min: 1,
        max: 300,
        feePercentage: 2.0,
      },
    },
  },
  [TierEnum.ENTERPRISE]: {
    name: TierEnum.ENTERPRISE,
    target: 'Corporates & Aggregators',
    description: 'For financial institutions and large-scale partners.',
    requirements: [
      UserRequirement.AdvancedBusinessReview,
      UserRequirement.InternalComplianceApproval,
    ],
    transactionLimits: {
      dailyCreditLimit: Infinity,
      dailyDebitLimit: 5_000_000,
      singleDebitLimit: 5_000_000,
    },
    txnFee: {
      [TxnTypeEnum.WITHDRAWAL]: {
        min: 1,
        max: 300,
        feePercentage: 2.0,
      },
    },
  },
  [TierEnum.NONE]: {
    name: TierEnum.NONE,
    target: 'Unverified Users',
    description: 'No verification. Access is restricted.',
    requirements: [],
    transactionLimits: {
      dailyCreditLimit: 0,
      dailyDebitLimit: 0,
      singleDebitLimit: 0,
    },
  },
};
