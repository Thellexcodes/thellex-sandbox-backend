export type Gender = 'Male' | 'Female';

export interface NinEntity {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  photo: string;
  gender: Gender;
  customer: string;
}

export interface BvnEntity {
  bvn: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: Gender;
  date_of_birth: string;
  phone_number1: string;
  phone_number2: string;
  image: string;
}

export interface PhoneNumberEntity {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: Gender;
  nationality: string;
  date_of_birth: string;
  msisdn: string;
}

export interface PhoneNumberLookupResponse {
  entity: PhoneNumberEntity;
}

export interface BvnLookupResponse {
  entity: BvnEntity;
}

export interface NinLookupResponse {
  entity: NinEntity;
}
