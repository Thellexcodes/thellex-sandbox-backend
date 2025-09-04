export enum WalletWebhookEventEnum {
  DepositTransactionConfirmation = 'deposit.transaction.confirmation',
  DepositSuccessful = 'deposit.successful',
  DepositFailed = 'deposit.failed',
  DepositOnHold = 'deposit.on_hold',
  DepositFailedAML = 'deposit.failed_aml',
  DepositRejected = 'deposit.rejected',

  WithdrawalSuccessful = 'withdraw.successful',
  WithdrawalFailed = 'withdrawal.failed',
  WithdrawRejected = 'withdraw.rejected',
  WithdrawPending = 'withdraw.pending',

  WalletUpdated = 'wallet.updated',
  WalletAddressGenerated = 'wallet.address.generated',
  WalletRejected = 'wallet.rejected',

  OrderDone = 'order.done',
  OrderCancelled = 'order.cancelled',

  SwapTransactionCompleted = 'swap_transaction.completed',
  SwapTransactionReversed = 'swap_transaction.reversed',
  SwapTransactionFailed = 'swap_transaction.failed',
}

export enum WalletErrorEnum {
  // Sub-account management
  SUBACCOUNT_ALREADY_EXISTS = 'SUBACCOUNT_ALREADY_EXISTS',
  SUBACCOUNT_CREATE_FAILED = 'SUBACCOUNT_CREATE_FAILED',
  FETCH_SUBACCOUNTS_FAILED = 'FETCH_SUBACCOUNTS_FAILED',
  FETCH_SUBACCOUNT_DETAILS_FAILED = 'FETCH_SUBACCOUNT_DETAILS_FAILED',
  SUBACCOUNT_UPDATE_FAILED = 'SUBACCOUNT_UPDATE_FAILED',
  FETCH_PARENT_ACCOUNT_FAILED = 'FETCH_PARENT_ACCOUNT_FAILED',

  // Wallets
  CREATE_USER_WALLET_FAILED = 'CREATE_USER_WALLET_FAILED',
  GET_USER_WALLETS_FAILED = 'GET_USER_WALLETS_FAILED',
  GET_USER_WALLET_FAILED = 'GET_USER_WALLET_FAILED',
  GET_PAYMENT_ADDRESS_FAILED = 'GET_PAYMENT_ADDRESS_FAILED',
  FETCH_PAYMENT_ADDRESSES_FAILED = 'FETCH_PAYMENT_ADDRESSES_FAILED',
  PAYMENT_ADDRESS_BY_ID_FETCH_FAILED = 'PAYMENT_ADDRESS_BY_ID_FETCH_FAILED',
  CREATE_PAYMENT_ADDRESS_FAILED = 'CREATE_PAYMENT_ADDRESS_FAILED',
  REENQUEUE_WALLET_ADDRESS_FAILED = 'REENQUEUE_WALLET_ADDRESS_FAILED',

  // Address validation
  VALIDATE_ADDRESS_FAILED = 'VALIDATE_ADDRESS_FAILED',

  // Withdrawals
  FETCH_WITHDRAWALS_FAILED = 'FETCH_WITHDRAWALS_FAILED',
  CANCEL_WITHDRAWAL_FAILED = 'CANCEL_WITHDRAWAL_FAILED',
  GET_WITHDRAWAL_FAILED = 'GET_WITHDRAWAL_FAILED',
  CREATE_WITHDRAWAL_FAILED = 'CREATE_WITHDRAWAL_FAILED',
  BALANCE_LOW = 'BALANCE_LOW',
  NETWORK_UNSUPPORTED = 'NETWORK_UNSUPPORTED',
  FETCH_WITHDRAWAL_BY_REFERENCE_FAILED = 'FETCH_WITHDRAWAL_BY_REFERENCE_FAILED',

  // Token issues
  UNSUPPORTED_TOKEN = 'UNSUPPORTED_TOKEN',

  // Generic fallback
  QWALLET_INTERNAL_ERROR = 'QWALLET_INTERNAL_ERROR',

  // Wallet lookup errors
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  MISSING_WALLET_ID = 'MISSING_WALLET_ID',

  // Balance errors
  MAPLERAD_BALANCE_LOW = 'MAPLERAD_BALANCE_LOW',
  YELLOWCARD_BALANCE_LOW = 'YELLOWCARD_BALANCE_LOW',
  KOTANIPAY_BALANCE_LOW = 'KOTANIPAY_BALANCE_LOW',
  VFD_BALANCE_LOW = 'VFD_BALANCE_LOW',
}

export enum WalletType {
  QWALLET = 'qwallet',
  CWALLET = 'cwallet',
}

export enum CircleNotificationTypeEnum {
  TransactionsOutbound = 'transactions.outbound',
  TransactionsInbound = 'transactions.inbound',
  WebhookTest = 'webhooks.test',
  Cleared = 'cleared',
}

export enum CircleTransactionType {
  Outbound = 'OUTBOUND',
  Inbound = 'INBOUND',
}

export enum FeeLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}
