export class IMRCreateCustomerResponseDto<T> {
  status: boolean;
  message: string;
  data: T;
}

export class IMRCustomerDataDto {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  status: string;
  tier: number;
  created_at: string;
  updated_at: string;
}

export class IMRInstitutionDto {
  name: string;
  code: string;
}

export type IMRInstitutionResponseDto = IMRCreateCustomerResponseDto<
  IMRInstitutionDto[]
>;

export class IMRCreateBankAccountResponseDto {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency: string;
  created_at: string;
  require_consent: boolean;
  consented: boolean;
  consent_url: string;
  reference: string;
  iban: string;
  eur: string;
}

export type IMRBankAccountResponseDto =
  IMRCreateCustomerResponseDto<IMRCreateBankAccountResponseDto>;
