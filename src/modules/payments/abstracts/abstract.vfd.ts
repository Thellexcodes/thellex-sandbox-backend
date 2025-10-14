import {
  VfdAccountType,
  VfdAuthResponseDto,
  VfdBankAccountDataDto,
  VfdBankDataDto,
  VfdBankListResponseDto,
  VfdBeneficiaryEnquiryResponseDto,
  VfdBVNResposeDto,
  VfdCreateClientResponseDataDto,
  VfdCreateClientWithBvnAndNinRequestDto,
  VfdCreateClientWithBvnRequestDto,
  VfdCreateClientWithNinRequestDto,
  VfdCreateConsentRequestDto,
  VfdCreateConsentResponseDto,
  VfdNINResponseDto,
  VfdUpgradeBvnAccountRequestDto,
  VfdUpgradeNinAccountRequestDto,
} from '@/models/payments/vfd.types';
import { AxiosResponse } from 'axios';

/**
 * Abstract Service Definition for VFD Integration
 * Defines all supported endpoints and core methods.
 */
export abstract class AbstractVfdService {
  // ============================================
  // 1.0 Authorization
  // ============================================
  abstract authenticate(): Promise<void>;

  // ============================================
  // 2.0 Banks
  // ============================================
  abstract getAllBanks(): Promise<VfdBankDataDto[]>;

  // ============================================
  // 3.0 Wallet Implementations
  // ============================================
  abstract createPoolWallet(): Promise<AxiosResponse>;
  abstract createOneToOneWallet(): Promise<AxiosResponse>;

  // ============================================
  // 4.0 Allowed Operations
  // ============================================
  abstract getAllowedOperations(): Promise<AxiosResponse>;

  // ============================================
  // 5.0 Inward Credit Notifications
  // ============================================
  abstract inwardCreditNotification(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract initialInwardCreditNotification(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract retriggerWebhookNotification(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;

  // ============================================
  // 6.0 Account Creation (No Consent)
  // ============================================
  abstract createIndividualClientWithNin(
    data: VfdCreateClientWithNinRequestDto,
  ): Promise<VfdCreateClientResponseDataDto>;
  abstract createIndividualClientWithBvn(
    data: VfdCreateClientWithBvnRequestDto,
  ): Promise<VfdCreateClientResponseDataDto>;
  abstract createIndividualClientWithBvnAndNin(
    data: VfdCreateClientWithBvnAndNinRequestDto,
  ): Promise<VfdCreateClientResponseDataDto>;
  abstract createCorporateClient(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract createVirtualAccount(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract updateVirtualAccount(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;

  // ============================================
  // 7.0 Account Creation (Consent Method)
  // ============================================
  abstract createIndividualWithConsent(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract createCorporateWithConsent(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract requestBvnConsent(
    data: VfdCreateConsentRequestDto,
  ): Promise<VfdCreateConsentResponseDto>;
  abstract igreeNotifications(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract releaseAccount(data: Record<string, any>): Promise<AxiosResponse>;

  // ============================================
  // 8.0 Tiered Account Creation & Upgrades
  // ============================================
  abstract createIndividualTierAccount(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract upgradeAccountOfNinToTier3(
    data: VfdUpgradeNinAccountRequestDto,
  ): Promise<VfdNINResponseDto>;
  abstract upgradeAccountOfBvnToTier3(
    data: VfdUpgradeBvnAccountRequestDto,
  ): Promise<VfdBVNResposeDto>;
  abstract createCorporateTierAccount(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract createCorporateSubAccount(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;

  // ============================================
  // 9.0 KYC Enquiry
  // ============================================
  abstract getClientByBvn(bvn: string): Promise<AxiosResponse>;
  abstract lookupBvnAccount(data: Record<string, any>): Promise<AxiosResponse>;

  // ============================================
  // 10.0 Account Enquiry
  // ============================================
  abstract getSubAccounts(
    entity: VfdAccountType,
    page: number,
    size: number,
  ): Promise<VfdCreateClientResponseDataDto[]>;

  // ============================================
  // 11.0 Transfer Services
  // ============================================
  abstract accountEnquiry(
    accountNumber: string,
    bankCode: string,
  ): Promise<VfdBankAccountDataDto>;
  abstract beneficiaryEnquiry(
    beneficiaryAccount: string,
    bankCode: string,
  ): Promise<VfdBeneficiaryEnquiryResponseDto | any>;
  abstract transferFunds(data: Record<string, any>): Promise<AxiosResponse>;
  abstract getBankList(): Promise<VfdBankListResponseDto>;
  abstract checkTransferStatus(reference: string): Promise<AxiosResponse>;
  abstract reverseTransaction(reference: string): Promise<AxiosResponse>;

  // ============================================
  // 12.0 Transaction Enquiry
  // ============================================
  abstract getAccountTransactions(
    accountNumber: string,
  ): Promise<AxiosResponse>;
  abstract getTransactionLimit(): Promise<AxiosResponse>;

  // ============================================
  // 13.0 QR Code Services
  // ============================================
  abstract generateQrCode(data: Record<string, any>): Promise<AxiosResponse>;
  abstract queryQrCode(code: string): Promise<AxiosResponse>;
  abstract payWithQrCode(data: Record<string, any>): Promise<AxiosResponse>;

  // ============================================
  // 14.0 Account Upgrade
  // ============================================
  abstract updateAccountWithBvn(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract updateAccountCompliance(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
  abstract upgradeIndividualToCorporate(
    data: Record<string, any>,
  ): Promise<AxiosResponse>;
}
