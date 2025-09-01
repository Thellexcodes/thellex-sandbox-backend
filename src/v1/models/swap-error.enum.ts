export enum CreateSwapValidationErrors {
  UserIdRequired = 'USER_ID_REQUIRED',
  FromCurrencyRequired = 'FROM_CURRENCY_REQUIRED',
  ToCurrencyRequired = 'TO_CURRENCY_REQUIRED',
  FromAmountInvalid = 'FROM_AMOUNT_INVALID',
  ToAmountInvalid = 'TO_AMOUNT_INVALID',
  EitherFromOrToAmountRequired = 'EITHER_FROM_OR_TO_AMOUNT_REQUIRED',
}
