export type Gender = 'Male' | 'Female';

export interface NinFullEntity {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  photo: string;
  gender: Gender;
  customer: string;
}

export interface BvnFullEntity {
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

export interface PhoneNumberFullEntity {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: Gender;
  nationality: string;
  date_of_birth: string;
  msisdn: string;
}

export interface BvnVerificationResponse {
  entity: {
    bvn: {
      value: string;
      status: boolean;
    };
    first_name: {
      confidence_value: number;
      status: boolean;
    };
  };
}

export interface PhoneNumberLookupResponse {
  entity: PhoneNumberFullEntity;
}

export interface BvnLookupResponse {
  entity: BvnFullEntity;
}

export interface NinLookupResponse {
  entity: NinFullEntity;
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
