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

export type EmailReputation = 'high' | 'medium' | 'low' | 'n/a';
export type DomainReputation = 'high' | 'medium' | 'low' | 'n/a';

export interface EmailCheckerDetails {
  blacklisted: boolean;
  malicious_activity: boolean;
  malicious_activity_recent: boolean;
  credentials_leaked: boolean;
  credentials_leaked_recent: boolean;
  data_breach: boolean;
  first_seen: string;
  last_seen: string;
  domain_exists: boolean;
  domain_reputation: DomainReputation;
  new_domain: boolean;
  days_since_domain_creation: number;
  suspicious_tld: boolean;
  spam: boolean;
  free_provider: boolean;
  disposable: boolean;
  deliverable: boolean;
  accept_all: boolean;
  valid_mx: boolean;
  primary_mx: string;
  spoofable: boolean;
  spf_strict: boolean;
  dmarc_enforced: boolean;
  profiles: string[];
}

export interface EmailCheckerEntity {
  email: string;
  reputation: EmailReputation;
  suspicious: boolean;
  references: number;
  details: EmailCheckerDetails;
}

export interface EmailCheckerResponse {
  entity: EmailCheckerEntity;
}
