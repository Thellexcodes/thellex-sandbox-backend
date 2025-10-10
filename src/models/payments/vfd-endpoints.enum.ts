export enum VfdWalletApiEndpoints {
  // Authentication
  AUTHENTICATE = '/baas-portal/v1.1/baasauth/token',

  // Banks
  GET_ALL_BANKS = '/v2/wallet2/bank',
  GET_BANK_LIST = '/banks',

  // Wallet Implementations
  CREATE_POOL_WALLET = '/wallet/pool',
  CREATE_ONE_TO_ONE_WALLET = '/wallet/1-1',
  GET_ALLOWED_OPERATIONS = '/wallet/allowed-operations',

  // Inward Credit Notifications
  INWARD_CREDIT_NOTIFICATION = '/wallet/inward-credit',
  INITIAL_INWARD_CREDIT_NOTIFICATION = '/wallet/inward-credit/initial',
  RETRIGGER_WEBHOOK = '/wallet/webhook/retrigger',

  // Account Creation - No Consent
  CREATE_INDIVIDUAL_CLIENT = '/client/create',
  CREATE_INDIVIDUAL_CLIENT_WITH_NIN = '/client/tiers/individual',
  CREATE_CORPORATE_CLIENT = '/corporateclient/create',
  CREATE_VIRTUAL_ACCOUNT = '/virtualaccount/create',
  UPDATE_VIRTUAL_ACCOUNT = '/virtualaccount/update',

  // Account Creation - Consent
  CREATE_INDIVIDUAL_WITH_CONSENT = '/client/individual',
  CREATE_CORPORATE_WITH_CONSENT = '/client/corporate',
  REQUEST_BVN_CONSENT = '/v2/wallet2/bvn-consent',
  IGREE_NOTIFICATIONS = '/bvn/igree-notifications',
  RELEASE_ACCOUNT = '/account/release',

  // Account Creation - Tiers
  CREATE_CORPORATE_TIER_ACCOUNT = '/client/tiers/corporate',
  UPGRADE_ACCOUNT_TO_TIER3 = '/client/update',

  // KYC Enquiry
  GET_CLIENT_BY_BVN = '/client/bvn',
  LOOKUP_BVN_ACCOUNT = '/bvn/lookup',

  // Account Enquiry
  GET_SUB_ACCOUNTS = '/account',

  // Transfer Services
  TRANSFER_FUNDS = '/transfer',
  CHECK_TRANSFER_STATUS = '/transfer/status',
  REVERSE_TRANSACTION = '/transfer/reverse',

  // Transaction Enquiry
  GET_ACCOUNT_TRANSACTIONS = '/transactions',
  GET_TRANSACTION_LIMIT = '/transactions/limit',

  // QR Code Services
  GENERATE_QR_CODE = '/qr/generate',
  QUERY_QR_CODE = '/qr/query',
  PAY_WITH_QR_CODE = '/qr/pay',

  // Account Upgrade
  UPDATE_ACCOUNT_WITH_BVN = '/account/update/bvn',
  UPDATE_ACCOUNT_COMPLIANCE = '/account/update/compliance',
  UPGRADE_INDIVIDUAL_TO_CORPORATE = '/account/upgrade/corporate',
}
