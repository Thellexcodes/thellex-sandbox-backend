import { UserRequirement } from './userKycRequirements';

type FeeRange = {
  type: 'Crypto Off/On-Ramp' | 'POS Payments';
  min: number;
  max?: number;
  feePercentage: number;
};

type TransactionLimits = {
  dailyCreditLimit: number;
  dailyDebitLimit: number;
  singleDebitLimit: number;
};

type Tier = {
  name: string;
  target: string;
  description: string;
  requirements: UserRequirement[];
  transactionLimits: TransactionLimits;
  fees: FeeRange[];
};

export const thellexTiers: Record<string, Tier> = {
  tier1: {
    name: 'Basic Tier',
    target: 'First-time & Basic Users',
    description: 'Users verified with both NIN and BVN.',
    requirements: [UserRequirement.NIN, UserRequirement.BVN],
    transactionLimits: {
      dailyCreditLimit: 50000,
      dailyDebitLimit: 50000,
      singleDebitLimit: 50000,
    },
    fees: [
      { type: 'Crypto Off/On-Ramp', min: 1, max: 300, feePercentage: 2 },
      { type: 'POS Payments', min: 0, max: 19999, feePercentage: 2 },
    ],
  },
  personal: {
    name: 'Personal Tier',
    target: 'Verified Individuals',
    description:
      'Users with verified face and address — regular POS/crypto users.',
    requirements: [
      UserRequirement.FaceVerification,
      UserRequirement.ResidentialAddress,
    ],
    transactionLimits: {
      dailyCreditLimit: 500000,
      dailyDebitLimit: 500000,
      singleDebitLimit: 100000,
    },
    fees: [
      { type: 'Crypto Off/On-Ramp', min: 301, max: 600, feePercentage: 1.5 },
      { type: 'POS Payments', min: 20000, max: 39999, feePercentage: 1.5 },
    ],
  },
  professional: {
    name: 'Professional Tier',
    target: 'High-Volume Users',
    description: 'Traders, investors, and crypto-savvy professionals.',
    requirements: [
      UserRequirement.ResidentialAddressVerification,
      UserRequirement.SignedIndemnityForm,
    ],
    transactionLimits: {
      dailyCreditLimit: 1000000,
      dailyDebitLimit: 1000000,
      singleDebitLimit: 500000,
    },
    fees: [
      { type: 'Crypto Off/On-Ramp', min: 601, max: 1000, feePercentage: 1.2 },
      { type: 'POS Payments', min: 40000, feePercentage: 1.2 },
    ],
  },
  business: {
    name: 'Business Tier',
    target: 'SMEs & Startups',
    description:
      'Registered CAC businesses with moderate-to-high transactions.',
    requirements: [
      UserRequirement.CACCertificate,
      UserRequirement.BusinessVerificationDocs,
      UserRequirement.BusinessNameReview,
      UserRequirement.Attestation,
    ],
    transactionLimits: {
      dailyCreditLimit: 3000000,
      dailyDebitLimit: 3000000,
      singleDebitLimit: 1000000,
    },
    fees: [
      { type: 'Crypto Off/On-Ramp', min: 601, max: 1000, feePercentage: 1.2 },
      { type: 'POS Payments', min: 50000, feePercentage: 1 },
    ],
  },
  enterprise: {
    name: 'Enterprise Tier',
    target: 'Corporates & Aggregators',
    description: 'Financial institutions and large partners.',
    requirements: [
      UserRequirement.AdvancedBusinessReview,
      UserRequirement.InternalComplianceApproval,
    ],
    transactionLimits: {
      dailyCreditLimit: Infinity,
      dailyDebitLimit: 5000000,
      singleDebitLimit: 5000000,
    },
    fees: [
      { type: 'Crypto Off/On-Ramp', min: 601, max: 1000, feePercentage: 1 },
      { type: 'POS Payments', min: 50000, feePercentage: 0.8 },
    ],
  },
};
