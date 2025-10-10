import { getAppConfig } from '@/constants/env';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { HttpService } from '@/middleware/http.service';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { AbstractVfdService } from './abstracts/vfd.abstract';
import { RequestResponseTypeDto } from '@/models/base-response.dto';
import {
  CreateIndividualClientResponseDataDto,
  CreateIndividualClientWithBvnDto,
  CreateIndividualClientWithNinDto,
  CreateIndividualConsentDto,
  CreateUpgradeAccountOfBvnToTier3Dto,
  CreateUpgradeAccountOfNinToTier3Dto,
  UpdateAccountOfBvnToTier3ResponseDto,
  VFDBankDto,
  VFDBankResponseDto,
} from '@/models/vfd.types';

@Injectable()
export class VfdService extends AbstractVfdService {
  constructor(private readonly http: HttpService) {
    super();

    // this.requestBvnConsent({
    //   type: '02',
    //   bvn: '22222222276',
    // });

    // this.createIndividualClientWithBvn({
    //   bvn: '22222222253',
    //   dob: '05-Apr-1994',
    // });

    //     1] {
    // [1]   status: '00',
    // [1]   message: 'Successful Creation',
    // [1]   data: {
    // [1]     firstname: 'Thellex-Golaith',
    // [1]     middlename: 'Chesnut',
    // [1]     lastname: 'David',
    // [1]     bvn: 'TX-22222222253',
    // [1]     phone: 'TX-09019056934',
    // [1]     dob: '05-Apr-1994',
    // [1]     accountNo: '1001674530'
    // [1]   }
    // [1] }

    // this.upgradeAccountOfBvnToTier3({
    //   accountNo: '1001674530',
    //   bvn: '22222222253',
    //   address: '5, Johnson Str, Ikeja, Lagos',
    // });
  }

  // ============================================
  // 1.0 Banks
  // ============================================

  async getAllBanks(): Promise<VFDBankDto[]> {
    try {
      const response: RequestResponseTypeDto<VFDBankResponseDto> =
        await this.http.get(`${this.baseUrl}/bank`, this.authHeader());

      return response.data.bank;
    } catch (err) {
      console.log(err);
    }
  }

  // ============================================
  // 2.0 Wallet Implementations
  // ============================================
  async createPoolWallet(): Promise<AxiosResponse> {
    return this.http.post(`${this.baseUrl}/wallet/pool`, {}, this.authHeader());
  }

  async createOneToOneWallet(): Promise<AxiosResponse> {
    return this.http.post(`${this.baseUrl}/wallet/1-1`, {}, this.authHeader());
  }

  // ============================================
  // 3.0 Allowed Operations
  // ============================================
  async getAllowedOperations(): Promise<AxiosResponse> {
    return this.http.get(
      `${this.baseUrl}/wallet/allowed-operations`,
      this.authHeader(),
    );
  }

  // ============================================
  // 4.0 Inward Credit Notifications
  // ============================================
  async inwardCreditNotification(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/wallet/inward-credit`,
      data,
      this.authHeader(),
    );
  }

  async initialInwardCreditNotification(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/wallet/inward-credit/initial`,
      data,
      this.authHeader(),
    );
  }

  async retriggerWebhookNotification(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/wallet/webhook/retrigger`,
      data,
      this.authHeader(),
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
          `${this.baseUrl}/client/tiers/individual?nin=${data.nin}&dateOfBirth=${data.dob}`,
          data,
          this.authHeader(),
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
          `${this.baseUrl}/client/create?bvn=${data.bvn}&dateOfBirth=${data.dob}`,
          data,
          this.authHeader(),
        );
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async createCorporateClient(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/corporateclient/create`,
      data,
      this.authHeader(),
    );
  }

  async createVirtualAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/virtualaccount/create`,
      data,
      this.authHeader(),
    );
  }

  async updateVirtualAccount(data: any): Promise<AxiosResponse> {
    return this.http.put(
      `${this.baseUrl}/virtualaccount/update`,
      data,
      this.authHeader(),
    );
  }

  // ============================================
  // ACCOUNT CREATION (CONSENT METHOD)
  // ============================================
  async createIndividualWithConsent(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/client/individual`,
      data,
      this.authHeader(),
    );
  }

  async createCorporateWithConsent(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/client/corporate`,
      data,
      this.authHeader(),
    );
  }

  async requestBvnConsent(
    data: CreateIndividualConsentDto,
  ): Promise<CreateIndividualClientResponseDataDto> {
    console.log(data);
    try {
      const response: RequestResponseTypeDto<CreateIndividualClientResponseDataDto> =
        await this.http.post(
          `${this.baseUrl}/v2/wallet2/bvn-consent?bvn=${data.bvn}&type=${data.type}&reference=${data.reference}`,
          data,
          this.authHeader(),
        );

      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async igreeNotifications(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/bvn/igree-notifications`,
      data,
      this.authHeader(),
    );
  }

  async releaseAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/account/release`,
      data,
      this.authHeader(),
    );
  }

  // ============================================
  // NEW ACCOUNT CREATION (TIERS)
  // ============================================
  async createIndividualTierAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/client/tiers/individual`,
      data,
      this.authHeader(),
    );
  }

  async upgradeAccountOfBvnToTier3(
    data: CreateUpgradeAccountOfBvnToTier3Dto,
  ): Promise<UpdateAccountOfBvnToTier3ResponseDto> {
    try {
      const res: RequestResponseTypeDto<UpdateAccountOfBvnToTier3ResponseDto> =
        await this.http.post(
          `${this.baseUrl}/client/update`,
          data,
          this.authHeader(),
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
          `${this.baseUrl}/client/update`,
          data,
          this.authHeader(),
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
        `${this.baseUrl}/client/tiers/corporate`,
        data,
        this.authHeader(),
      );

      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }

  async createCorporateSubAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/corporate/subaccount/create`,
      data,
      this.authHeader(),
    );
  }

  // ============================================
  // KYC ENQUIRY
  // ============================================
  async getClientByBvn(bvn: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.baseUrl}/client/bvn/${bvn}`,
      this.authHeader(),
    );
  }

  async lookupBvnAccount(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/bvn/lookup`,
      data,
      this.authHeader(),
    );
  }

  // ============================================
  // ACCOUNT ENQUIRY
  // ============================================
  async getSubAccounts(clientId: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.baseUrl}/account/${clientId}/subaccounts`,
      this.authHeader(),
    );
  }

  // ============================================
  // TRANSFER SERVICES
  // ============================================
  async transferFunds(data: any): Promise<AxiosResponse> {
    return this.http.post(`${this.baseUrl}/transfer`, data, this.authHeader());
  }

  async getBankList(): Promise<AxiosResponse> {
    return this.http.get(`${this.baseUrl}/banks`, this.authHeader());
  }

  async checkTransferStatus(reference: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.baseUrl}/transfer/status/${reference}`,
      this.authHeader(),
    );
  }

  async reverseTransaction(reference: string): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/transfer/reverse/${reference}`,
      {},
      this.authHeader(),
    );
  }

  // ============================================
  // TRANSACTION ENQUIRY
  // ============================================
  async getAccountTransactions(accountNumber: string): Promise<AxiosResponse> {
    return this.http.get(
      `${this.baseUrl}/transactions/${accountNumber}`,
      this.authHeader(),
    );
  }

  async getTransactionLimit(): Promise<AxiosResponse> {
    return this.http.get(
      `${this.baseUrl}/transactions/limit`,
      this.authHeader(),
    );
  }

  // ============================================
  // QR CODE SERVICES
  // ============================================
  async generateQrCode(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/qr/generate`,
      data,
      this.authHeader(),
    );
  }

  async queryQrCode(code: string): Promise<AxiosResponse> {
    return this.http.get(`${this.baseUrl}/qr/query/${code}`, this.authHeader());
  }

  async payWithQrCode(data: any): Promise<AxiosResponse> {
    return this.http.post(`${this.baseUrl}/qr/pay`, data, this.authHeader());
  }

  // ============================================
  // ACCOUNT UPGRADE
  // ============================================
  async updateAccountWithBvn(data: any): Promise<AxiosResponse> {
    return this.http.put(
      `${this.baseUrl}/account/update/bvn`,
      data,
      this.authHeader(),
    );
  }

  async updateAccountCompliance(data: any): Promise<AxiosResponse> {
    return this.http.put(
      `${this.baseUrl}/account/update/compliance`,
      data,
      this.authHeader(),
    );
  }

  async upgradeIndividualToCorporate(data: any): Promise<AxiosResponse> {
    return this.http.post(
      `${this.baseUrl}/account/upgrade/corporate`,
      data,
      this.authHeader(),
    );
  }

  // ============================================
  // UTILS
  // ============================================
  private authHeader() {
    return {
      headers: {
        AccessToken: getAppConfig().Vfd.AUTH_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
  }

  private get baseUrl(): string {
    return getAppConfig().Vfd.API;
  }
}
