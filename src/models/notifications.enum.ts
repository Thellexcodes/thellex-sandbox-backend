export enum NotificationsEnum {
  // User actions
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',
  ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',

  // Payment and transaction updates
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',

  // POS specific
  POS_SESSION_STARTED = 'POS_SESSION_STARTED',
  POS_SESSION_ENDED = 'POS_SESSION_ENDED',
  POS_DEVICE_CONNECTED = 'POS_DEVICE_CONNECTED',
  POS_DEVICE_DISCONNECTED = 'POS_DEVICE_DISCONNECTED',

  // Order related
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',

  // Wallet/crypto
  CRYPTO_DEPOSIT_SUCCESSFUL = 'CRYPTO_DEPOSIT_SUCCESSFUL',
  CRYPTO_WITHDRAWAL_SUCCESSFUL = 'CRYPTO_WITHDRAWAL_SUCCESSFUL',
  CRYPTO_WITHDRAWAL_FAILED = 'CRYPTO_WITHDRAWAL_FAILED',

  // Admin/system
  NEW_DEVICE_REGISTERED = 'NEW_DEVICE_REGISTERED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
}

export enum NotificationMessageEnum {
  CRYPTO_DEPOSIT_SUCCESSFUL = 'You’ve successfully deposited',
  CRYPTO_WITHDRAW_SUCCESSFUL = 'You’ve successfully withdrawn',
  PAYMENT_FAILED = 'Your payment failed',
  PAYMENT_SUCCESSFUL = 'Your payment was successful',
  WALLET_CREATED = 'Your wallet has been created',
  TRANSACTION_PENDING = 'Your transaction is pending',
  TRANSACTION_FAILED = 'Your transaction failed',
  TRANSACTION_SUCCESSFUL = 'Your transaction was successful',
  ACCOUNT_VERIFIED = 'Your account has been verified',
  ACCOUNT_SUSPENDED = 'Your account has been suspended',
  LOGIN_SUCCESSFUL = 'Login successful',
  LOGIN_FAILED = 'Login attempt failed',
  KYC_APPROVED = 'Your KYC has been approved',
  KYC_REJECTED = 'Your KYC was rejected',
  PASSWORD_CHANGED = 'Your password has been changed',
  PASSWORD_RESET = 'Your password has been reset',
  TWO_FACTOR_ENABLED = 'Two-factor authentication enabled',
  TWO_FACTOR_DISABLED = 'Two-factor authentication disabled',
}

export enum NotificationErrors {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CREATE_FAILED = 'CREATE_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
}
