export class TransferResponseDto {
  bank_code!: string;
  account_number!: string;
  amount: number = 0;
  reason!: string;
  currency!: string;
  reference!: string;
  meta?: Record<string, any>;
  scheme!: string;
  sender!: {
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    country: string;
  };
  counterparty!: {
    first_name: string;
    last_name: string;
    address: string;
    phone_number: string;
    identity_type: string;
    country: string;
  };
}
