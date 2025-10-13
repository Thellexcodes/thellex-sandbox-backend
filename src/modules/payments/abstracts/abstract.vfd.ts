import { VfdBankListResponseDto } from '@/models/payments/vfd.types';
import { AxiosResponse } from 'axios';

export abstract class AbstractVfdService {
  // ============================================
  // 1.0 Authorization
  // ============================================
  abstract authenticate(): Promise<{
    baasToken: string;
    token_type: string;
  }>;

  // ============================================
  // 1.0 Banks
  // ============================================
  abstract getAllBanks(): Promise<VfdBankListResponseDto[]>;

  // ============================================
  // 2.0 Wallet Implementations
  // ============================================
  abstract createPoolWallet(): Promise<AxiosResponse>;
  abstract createOneToOneWallet(): Promise<AxiosResponse>;

  // ============================================
  // 3.0 Allowed Operations
  // ============================================
  abstract getAllowedOperations(): Promise<AxiosResponse>;

  // ============================================
  // 4.0 Inward Credit Notifications
  // ============================================
  abstract inwardCreditNotification(data: any): Promise<AxiosResponse>;
  abstract initialInwardCreditNotification(data: any): Promise<AxiosResponse>;
  abstract retriggerWebhookNotification(data: any): Promise<AxiosResponse>;

  // ============================================
  // Account Creation (No Consent)
  // ============================================
  abstract createIndividualClientWithNin(
    data: any,
  ): Promise<AxiosResponse | any>;
  abstract createIndividualClientWithBvn(
    data: any,
  ): Promise<AxiosResponse | any>;
  abstract createIndividualClientWithBvnAndNin(
    data: any,
  ): Promise<AxiosResponse | any>;
  abstract createCorporateClient(data: any): Promise<AxiosResponse>;
  abstract createVirtualAccount(data: any): Promise<AxiosResponse>;
  abstract updateVirtualAccount(data: any): Promise<AxiosResponse>;

  // ============================================
  // Account Creation (Consent Method)
  // ============================================
  abstract createIndividualWithConsent(data: any): Promise<AxiosResponse>;
  abstract createCorporateWithConsent(data: any): Promise<AxiosResponse>;
  abstract requestBvnConsent(
    data: CreateIndividualConsentDto,
  ): Promise<CreateIndividualClientResponseDataDto>;
  abstract igreeNotifications(data: any): Promise<AxiosResponse>;
  abstract releaseAccount(data: any): Promise<AxiosResponse>;

  // ============================================
  // New Account Creation (Tiers)
  // ============================================
  abstract createIndividualTierAccount(data: any): Promise<AxiosResponse>;
  abstract upgradeAccountOfNinToTier3(
    data: any,
  ): Promise<UpdateAccountOfBvnToTier3ResponseDto>;
  abstract upgradeAccountOfBvnToTier3(
    data: any,
  ): Promise<UpdateAccountOfBvnToTier3ResponseDto>;
  abstract createCorporateTierAccount(data: any): Promise<AxiosResponse>;
  abstract createCorporateSubAccount(data: any): Promise<AxiosResponse>;

  // ============================================
  // KYC Enquiry
  // ============================================
  abstract getClientByBvn(bvn: string): Promise<AxiosResponse>;
  abstract lookupBvnAccount(data: any): Promise<AxiosResponse>;

  // ============================================
  // Account Enquiry
  // ============================================
  abstract getSubAccounts(
    entity: VFDAccountTypes,
    page: number,
    size: number,
  ): Promise<CreateIndividualClientResponseDataDto[]>;

  // ============================================
  // Transfer Services
  // ============================================
  abstract accountEnquiry(
    accountNumber: string,
    bankCode: string,
  ): Promise<void>;
  abstract beneficiaryEnquiry(
    beneficiaryAccount: string,
    bankCode: string,
  ): Promise<void>;
  abstract transferFunds(data: any): Promise<AxiosResponse>;
  abstract getBankList(): Promise<AxiosResponse>;
  abstract checkTransferStatus(reference: string): Promise<AxiosResponse>;
  abstract reverseTransaction(reference: string): Promise<AxiosResponse>;

  // ============================================
  // Transaction Enquiry
  // ============================================
  abstract getAccountTransactions(
    accountNumber: string,
  ): Promise<AxiosResponse>;
  abstract getTransactionLimit(): Promise<AxiosResponse>;

  // ============================================
  // QR Code Services
  // ============================================
  abstract generateQrCode(data: any): Promise<AxiosResponse>;
  abstract queryQrCode(code: string): Promise<AxiosResponse>;
  abstract payWithQrCode(data: any): Promise<AxiosResponse>;

  // ============================================
  // Account Upgrade
  // ============================================
  abstract updateAccountWithBvn(data: any): Promise<AxiosResponse>;
  abstract updateAccountCompliance(data: any): Promise<AxiosResponse>;
  abstract upgradeIndividualToCorporate(data: any): Promise<AxiosResponse>;
}
