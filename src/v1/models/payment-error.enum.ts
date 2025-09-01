export enum PaymentErrorEnum {
  INSUFFICIENT_FUNDS = 'payments/INSUFFICIENT_FUNDS',
  INVALID_ADDRESS = 'payments/INVALID_ADDRESS',
  NETWORK_NOT_SUPPORTED = 'payments/NETWORK_NOT_SUPPORTED',
  TOKEN_NOT_FOUND = 'payments/TOKEN_NOT_FOUND',
  PAYMENT_LIMIT_EXCEEDED = 'payments/LIMIT_EXCEEDED',
  DUPLICATE_REQUEST = 'payments/DUPLICATE_REQUEST',
  WITHDRAWAL_BLOCKED = 'payments/WITHDRAWAL_BLOCKED',
  NOT_FOUND = 'payments/NOT_FOUND',
  UNKNOWN = 'payments/UNKNOWN',
  COUNTRY_NOT_SUPPORTED = 'payments/COUNTRY_NOT_SUPPORTED',
  COUNTRY_NOT_ACTIVE = 'payments/COUNTRY_NOT_ACTIVE',
  RATES_NOT_YET_ACTIVE = 'payments/RATES_NOT_YET_ACTIVE',
  INSUFFICIENT_LIQUIDITY = 'payments/INSUFFICIENT_LIQUIDITY',

  INVALID_WALLET = 'payments/INVALID_WALLET', // Wallet not found or invalid
  DEPOSIT_CONFIRMATION_FAILED = 'payments/DEPOSIT_CONFIRMATION_FAILED', // Blockchain confirmation issue
  DEPOSIT_AMOUNT_TOO_LOW = 'payments/DEPOSIT_AMOUNT_TOO_LOW', // Below minimum deposit threshold
  DEPOSIT_EXPIRED = 'payments/DEPOSIT_EXPIRED', // Deposit transaction timed out
  UNSUPPORTED_ASSET = 'payments/UNSUPPORTED_ASSET', // Asset not supported for deposit

  WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE = 'payments/WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE', // Insufficient crypto balance
  WITHDRAWAL_TRANSACTION_FAILED = 'payments/WITHDRAWAL_TRANSACTION_FAILED', // Blockchain transaction failure
  WITHDRAWAL_FEE_TOO_HIGH = 'payments/WITHDRAWAL_FEE_TOO_HIGH', // Gas fees exceed acceptable limit
  INVALID_DESTINATION_ADDRESS = 'payments/INVALID_DESTINATION_ADDRESS', // Invalid recipient address
  WITHDRAWAL_PENDING = 'payments/WITHDRAWAL_PENDING', // Withdrawal stuck in pending state

  INVALID_BANK_ACCOUNT = 'payments/INVALID_BANK_ACCOUNT', // Invalid bank account details
  PAYMENT_GATEWAY_ERROR = 'payments/PAYMENT_GATEWAY_ERROR', // General payment gateway failure
  UNSUPPORTED_CURRENCY = 'payments/UNSUPPORTED_CURRENCY', // Currency not supported by provider
  PAYMENT_AMOUNT_TOO_LOW = 'payments/PAYMENT_AMOUNT_TOO_LOW', // Below minimum payment threshold
  BANK_REJECTION = 'payments/BANK_REJECTION', // Bank rejected the payment
  KYC_VERIFICATION_FAILED = 'payments/KYC_VERIFICATION_FAILED', // KYC requirements not met

  FIAT_WITHDRAWAL_LIMIT_EXCEEDED = 'payments/FIAT_WITHDRAWAL_LIMIT_EXCEEDED', // Exceeds daily/monthly limit
  FIAT_WITHDRAWAL_BANK_UNAVAILABLE = 'payments/FIAT_WITHDRAWAL_BANK_UNAVAILABLE', // Bank offline or unavailable
  FIAT_WITHDRAWAL_REJECTED = 'payments/FIAT_WITHDRAWAL_REJECTED', // Withdrawal rejected by bank/provider
  FIAT_WITHDRAWAL_PROCESSING_FAILED = 'payments/FIAT_WITHDRAWAL_PROCESSING_FAILED', // Processing error at provider

  API_CONNECTION_FAILED = 'payments/API_CONNECTION_FAILED', // Payment provider API unreachable
  RATE_LIMIT_EXCEEDED = 'payments/RATE_LIMIT_EXCEEDED', // API rate limit exceeded
  TIMEOUT = 'payments/TIMEOUT', // Request timed out
  INVALID_REQUEST = 'payments/INVALID_REQUEST', // Malformed request data
  SERVICE_UNAVAILABLE = 'payments/SERVICE_UNAVAILABLE', // Payment provider service down
  TRANSACTION_ALREADY_PROCESSED = 'payments/TRANSACTION_ALREADY_PROCESSED', // Duplicate transaction attempt
}
