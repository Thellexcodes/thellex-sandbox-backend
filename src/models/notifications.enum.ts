// ✅ Primary event types (used across system, sockets, etc.)
export enum NotificationEventEnum {
  // 🔐 Auth
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',

  // 👤 Account
  ACCOUNT_UPDATED = 'account_updated',
  ACCOUNT_VERIFIED = 'account_verified',
  ACCOUNT_SUSPENDED = 'account_suspended',

  // 💳 Payments
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_REFUNDED = 'payment_refunded',

  // 🔄 Conversions
  FIAT_TO_CRYPTO = 'fiat_to_crypto',
  CRYPTO_TO_FIAT = 'crypto_to_fiat',
  FIAT_TO_FIAT_DEPOSIT = 'fiat_to_fiat_deposit',
  FIAT_TO_FIAT_WITHDRAWAL = 'fiat_to_fiat_withdrawal',

  // 🪙 Crypto Transactions
  CRYPTO_DEPOSIT = 'crypto_deposit',
  CRYPTO_WITHDRAWAL = 'crypto_withdrawal',

  // 🧾 Orders
  ORDER_CREATED = 'order_created',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',

  // 🧾 POS
  POS_SESSION_STARTED = 'pos_session_started',
  POS_SESSION_ENDED = 'pos_session_ended',
  POS_DEVICE_CONNECTED = 'pos_device_connected',
  POS_DEVICE_DISCONNECTED = 'pos_device_disconnected',

  // 📬 Communication
  NEW_MESSAGE = 'new_message',
  FRIEND_REQUEST = 'friend_request',

  // ⚙️ System
  SYSTEM_ALERT = 'system_alert',
  PROMOTION = 'promotion',
  WALLET_CREATED = 'wallet_created',
  WALLET_ADDRESS_GENERATED = 'wallet_address_generated',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',

  // 🖥️ Devices
  DEVICE_REGISTERED = 'device_registered',
}

export enum NotificationStatusEnum {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum NotificationErrorEnum {
  NOTIFICATION_NOT_FOUND = 'notification/NOTIFICATION_NOT_FOUND',
  NOTIFICATION_ALREADY_CONSUMED = 'notification/NOTIFICATION_ALREADY_CONSUMED',
  INVALID_NOTIFICATION_ID = 'notification/INVALID_NOTIFICATION_ID',
  UNAUTHORIZED_ACCESS = 'notification/UNAUTHORIZED_ACCESS',
  INVALID_NOTIFICATION_KIND = 'notification/INVALID_NOTIFICATION_KIND',
  INTERNAL_ERROR = 'notification/INTERNAL_ERROR',
  CREATE_FAILED = 'notification/CREATE_FAILED',
}
