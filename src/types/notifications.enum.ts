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
  CRYPTO_DEPOSIT_SUCCESSFUL = 'You’ve_successfully_deposited',
  CRYPTO_WITHDRAW_SUCCESSFUL = 'You’ve_successfully_withdrawn',
  PAYMENT_FAILED = 'Your_payment_failed',
  PAYMENT_SUCCESSFUL = 'Your_payment_was_successful',
  WALLET_CREATED = 'Your_wallet_has_been_created',
  TRANSACTION_PENDING = 'Your_transaction_is_pending',
  TRANSACTION_FAILED = 'Your_transaction_failed',
  TRANSACTION_SUCCESSFUL = 'Your_transaction_was_successful',
  ACCOUNT_VERIFIED = 'Your_account_has_been_verified',
  ACCOUNT_SUSPENDED = 'Your_account_has_been_suspended',
  LOGIN_SUCCESSFUL = 'Login_successful',
  LOGIN_FAILED = 'Login_attempt_failed',
  KYC_APPROVED = 'Your_KYC_has_been_approved',
  KYC_REJECTED = 'Your_KYC_was_rejected',
  PASSWORD_CHANGED = 'Your_password_has_been_changed',
  PASSWORD_RESET = 'Your_password_has_been_reset',
  TWO_FACTOR_ENABLED = 'Two-factor_authentication_enabled',
  TWO_FACTOR_DISABLED = 'Two-factor_authentication_disabled',
}

export enum NotificationErrors {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CREATE_FAILED = 'CREATE_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
}
