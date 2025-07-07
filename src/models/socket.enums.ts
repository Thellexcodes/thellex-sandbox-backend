export enum NOTIFICATION_SOCKETS {
  DEPOSIT_SUCCESSFUL = 'deposit_successful',
  WITHDRAWAL_SUCCESSFUL = 'withdrawal_successful',
  TRANSACTION_FAILED = 'transaction_failed',
  NEW_MESSAGE = 'new_message',
  FRIEND_REQUEST = 'friend_request',
  SYSTEM_ALERT = 'system_alert',
  ACCOUNT_UPDATED = 'account_updated',
  PASSWORD_CHANGED = 'password_changed',
  PROMOTION = 'promotion',
  WALLET_ADDRESS_GENERATED = 'wallet_address_generated',
}

export enum TRANSACTION_NOTIFICATION_TYPES_ENUM {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
}

export enum WALLET_NOTIFICAITON_TYPES_ENUM {
  WalletAddressGenerated = 'wallet.address.generated',
}
