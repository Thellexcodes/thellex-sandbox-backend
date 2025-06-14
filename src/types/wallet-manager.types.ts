export enum WalletWebhookEventType {
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

export enum WalletType {
  QWALLET = 'qwallet',
  CWALLET = 'cwallet',
}
