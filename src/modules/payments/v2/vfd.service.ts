import { getAppConfig } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { AbstractVfdService } from '../abstracts/abstract.vfd';
import {
  VfdAuthResponseDto,
  VfdBankAccountDataDto,
  VfdBankListResponseDto,
} from '@/models/payments/vfd.types';
import { VfdWalletApiEndpoints } from '@/routes/vfd-endpoints.enum';
import { RequestResponseTypeDto } from '@/models/base-response.dto';

@Injectable()
export class VfdService extends AbstractVfdService {
  private baasToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private readonly http: HttpService) {
    super();
  }

  // ============================================
  // 1.0 Authentication
  // ============================================

  async authenticate() {
    if (this.baasToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return { baasToken: this.baasToken, token_type: 'Bearer' };
    }
    return;

    const response: RequestResponseTypeDto<VfdAuthResponseDto> =
      await this.http.post(
        `${this.baasUrl}${VfdWalletApiEndpoints.AUTHENTICATE}`,
        {
          consumerKey: getAppConfig().VFD.CONSUMER_KEY,
          consumerSecret: getAppConfig().VFD.CONSUMER_SECRET,
          validityTime: '-1',
        },
      );

    const { token_type } = response.data;

    this.baasToken = response.data.access_token;
    this.tokenExpiry = Date.now() + 60 * 60 * 1000;

    return { baasToken: this.baasToken, token_type };
  }

  // ============================================
  // 1.0 Banks
  // ============================================

  async getAllBanks() {
    try {
      const response: RequestResponseTypeDto<VfdBankListResponseDto> =
        await this.http.get(`${this.walletUrl}/bank`, this.walletHeader());

      return response.data.bank;
    } catch (err) {
      console.log(err);
    }
  }

  // ============================================
  // 2.0 Wallet Implementations
  // ============================================
  async createPoolWallet(): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/wallet/pool`,
      {},
      this.walletHeader(),
    );
  }

  async createOneToOneWallet(): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/wallet/1-1`,
      {},
      this.walletHeader(),
    );
  }

  // ============================================
  // 3.0 Allowed Operations
  // ============================================
  async getAllowedOperations(): Promise<AxiosResponse> {
    return this.http.get(
      `${this.walletUrl}/wallet/allowed-operations`,
      this.walletHeader(),
    );
  }

  // ============================================
  // 4.0 Inward Credit Notifications
  // ============================================
  async inwardCreditNotification(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/wallet/inward-credit`,
      data,
      this.walletHeader(),
    );
  }

  async initialInwardCreditNotification(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/wallet/inward-credit/initial`,
      data,
      this.walletHeader(),
    );
  }

  async retriggerWebhookNotification(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/wallet/webhook/retrigger`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // ACCOUNT CREATION (NO CONSENT METHOD)
  // ============================================
  async createIndividualClientWithNin(
    data: CreateIndividualClientWithNinDto,
  ): Promise<CreateIndividualClientResponseDataDto> {
    try {
      const response: RequestResponseTypeDto<CreateIndividualClientResponseDataDto> =
        await this.http.post(
          `${this.walletUrl}/client/tiers/individual?nin=${data.nin}&dateOfBirth=${data.dob}`,
          data,
          this.walletHeader(),
        );

      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async createIndividualClientWithBvn(
    data: CreateIndividualClientWithBvnDto,
  ): Promise<CreateIndividualClientResponseDataDto> {
    try {
      const response: RequestResponseTypeDto<CreateIndividualClientResponseDataDto> =
        await this.http.post(
          `${this.walletUrl}/client/create?bvn=${data.bvn}&dateOfBirth=${data.dob}`,
          data,
          this.walletHeader(),
        );

      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async createIndividualClientWithBvnAndNin(
    data: CreateIndividualClientWithBvnAndNinDto,
  ): Promise<CreateIndividualClientResponseDataDto> {
    try {
      const response: RequestResponseTypeDto<CreateIndividualClientResponseDataDto> =
        await this.http.post(
          `/client/tiers/individual?bvn=${data.bvn}&nin=${data.nin}&address=${data.address}&dateOfBirth=${data.dob}`,
          data,
          this.walletHeader(),
        );

      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async createCorporateClient(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/corporateclient/create`,
      data,
      this.walletHeader(),
    );
  }

  async createVirtualAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/virtualaccount/create`,
      data,
      this.walletHeader(),
    );
  }

  async updateVirtualAccount(data: any): Promise<AxiosResponse> {
    return this.http.put(
      `${this.walletUrl}/virtualaccount/update`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // ACCOUNT CREATION (CONSENT METHOD)
  // ============================================
  async createIndividualWithConsent(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/client/individual`,
      data,
      this.walletHeader(),
    );
  }

  async createCorporateWithConsent(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/client/corporate`,
      data,
      this.walletHeader(),
    );
  }

  async requestBvnConsent(
    data: CreateIndividualConsentDto,
  ): Promise<CreateIndividualClientResponseDataDto | any> {
    try {
      const response: RequestResponseTypeDto<CreateIndividualClientResponseDataDto> =
        await this.http.post(
          `${this.walletUrl}/v2/wallet2/bvn-consent?bvn=${data.bvn}&type=${data.type}&reference=${data.reference}`,
          data,
          this.walletHeader(),
        );

      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async igreeNotifications(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/bvn/igree-notifications`,
      data,
      this.walletHeader(),
    );
  }

  async releaseAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/account/release`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // NEW ACCOUNT CREATION (TIERS)
  // ============================================
  async createIndividualTierAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/client/tiers/individual`,
      data,
      this.walletHeader(),
    );
  }

  async upgradeAccountOfBvnToTier3(
    data: CreateUpgradeAccountOfBvnToTier3Dto,
  ): Promise<UpdateAccountOfBvnToTier3ResponseDto> {
    try {
      const res: RequestResponseTypeDto<UpdateAccountOfBvnToTier3ResponseDto> =
        await this.http.post(
          `${this.walletUrl}/client/update`,
          data,
          this.walletHeader(),
        );

      return res.data;
    } catch (err) {
      console.log(err);
    }
  }

  async upgradeAccountOfNinToTier3(
    data: CreateUpgradeAccountOfNinToTier3Dto,
  ): Promise<UpdateAccountOfBvnToTier3ResponseDto> {
    try {
      const res: RequestResponseTypeDto<UpdateAccountOfBvnToTier3ResponseDto> =
        await this.http.post(
          `${this.walletUrl}/client/update`,
          data,
          this.walletHeader(),
        );

      console.log(res);

      return res.data;
    } catch (err) {
      console.log(err);
    }
  }

  async createCorporateTierAccount(data: any): Promise<AxiosResponse | any> {
    try {
      const response = await this.http.post(
        `${this.walletUrl}/client/tiers/corporate`,
        data,
        this.walletHeader(),
      );

      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }

  async createCorporateSubAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/corporate/subaccount/create`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // KYC ENQUIRY
  // ============================================
  async getClientByBvn(bvn: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.walletUrl}/client/bvn/${bvn}`,
      this.walletHeader(),
    );
  }

  async lookupBvnAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/bvn/lookup`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // ACCOUNT ENQUIRY
  // ============================================
  async getSubAccounts(entity: VFDAccountTypes, page: number, size: number) {
    const response: RequestResponseTypeDto<VFDBankSubAccountResponseDto> =
      await this.http.get(
        `${this.walletUrl}/sub-accounts?entity=${entity}&size=${size}&page=${page}`,
        this.walletHeader(),
      );

    console.log(response.data.content);
    return response.data.content;
  }

  // ============================================
  // TRANSFER SERVICES
  // ============================================
  async accountEnquiry(accountNumber: string): Promise<void> {
    const response: RequestResponseTypeDto<VfdBankAccountDataDto> =
      await this.http.get(
        `${this.walletUrl}/account/enquiry?accountNumber=${accountNumber}`,
        this.walletHeader(),
      );

    console.log(response);
  }

  async beneficiaryEnquiry(
    beneficiaryAccount: string,
    bankCode: string,
  ): Promise<void> {}

  async transferFunds(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/transfer`,
      data,
      this.walletHeader(),
    );
  }

  async getBankList(): Promise<AxiosResponse> {
    return this.http.get(`${this.walletUrl}/banks`, this.walletHeader());
  }

  async checkTransferStatus(reference: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.walletUrl}/transfer/status/${reference}`,
      this.walletHeader(),
    );
  }

  async reverseTransaction(reference: string): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/transfer/reverse/${reference}`,
      {},
      this.walletHeader(),
    );
  }

  // ============================================
  // TRANSACTION ENQUIRY
  // ============================================
  async getAccountTransactions(accountNumber: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.walletUrl}/transactions/${accountNumber}`,
      this.walletHeader(),
    );
  }

  async getTransactionLimit(): Promise<AxiosResponse> {
    return this.http.get(
      `${this.walletUrl}/transactions/limit`,
      this.walletHeader(),
    );
  }

  // ============================================
  // QR CODE SERVICES
  // ============================================
  async generateQrCode(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/qr/generate`,
      data,
      this.walletHeader(),
    );
  }

  async queryQrCode(code: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.walletUrl}/qr/query/${code}`,
      this.walletHeader(),
    );
  }

  async payWithQrCode(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/qr/pay`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // ACCOUNT UPGRADE
  // ============================================
  async updateAccountWithBvn(data: any): Promise<AxiosResponse> {
    return this.http.put(
      `${this.walletUrl}/account/update/bvn`,
      data,
      this.walletHeader(),
    );
  }

  async updateAccountCompliance(data: any): Promise<AxiosResponse> {
    return this.http.put(
      `${this.walletUrl}/account/update/compliance`,
      data,
      this.walletHeader(),
    );
  }

  async upgradeIndividualToCorporate(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.walletUrl}/account/upgrade/corporate`,
      data,
      this.walletHeader(),
    );
  }

  // ============================================
  // UTILS
  // ============================================
  private walletHeader() {
    return {
      headers: {
        AccessToken: getAppConfig().VFD.WALLET_AUTH_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
  }

  private get walletUrl(): string {
    return getAppConfig().VFD.WALLET_API;
  }

  private get baasUrl(): string {
    return getAppConfig().VFD.BAAS_API;
  }
}
