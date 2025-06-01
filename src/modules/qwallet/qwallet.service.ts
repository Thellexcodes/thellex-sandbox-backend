import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QWALLET_API } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import { CreateSubAccountResponse } from '@/types/qwallet.types';
import { QwalletErrorEnum } from '@/types/qwallet-error.enum';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';

@Injectable()
export class QwalletService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(QwalletEntity)
    private readonly qwalletRepo: Repository<QwalletEntity>,
  ) {}

  private get qwalletUrl(): string {
    const env = this.configService.get<string>('NODE_ENV');
    return env === 'testnet' ? QWALLET_API.sandbox : QWALLET_API.production;
  }

  /**
   * Check if subaccount already exists for a user.
   */
  async lookupSubaccount(user: UserEntity): Promise<QwalletEntity | null> {
    return this.qwalletRepo.findOne({ where: { user } });
  }

  async createSubAccount(
    dto: any,
    user: UserEntity,
  ): Promise<CreateSubAccountResponse> {
    try {
      const subAccountRes =
        await this.httpService.post<CreateSubAccountResponse>(
          `${this.qwalletUrl}/users`,
          dto,
          { headers: this.getAuthHeaders() },
        );

      const newSubAccountRecord = new QwalletEntity();
      newSubAccountRecord.quidaxId = subAccountRes.data.id;
      newSubAccountRecord.user = user;
      newSubAccountRecord.quidaxSn = subAccountRes.data.sn;
      await this.qwalletRepo.save(newSubAccountRecord);

      return subAccountRes;
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.SUBACCOUNT_CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchParentAccount() {
    try {
      return await this.httpService.get(`${this.qwalletUrl}/users/me`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_PARENT_ACCOUNT_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchAllSubAccounts() {
    try {
      return await this.httpService.get(`${this.qwalletUrl}/users`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_SUBACCOUNTS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchSubAccountDetails(uuid: string) {
    try {
      return await this.httpService.get(`${this.qwalletUrl}/users/${uuid}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_SUBACCOUNT_DETAILS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // : Promise<GetUserWalletsResponse>
  async getUserWallets(uuid: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_USER_WALLETS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // : Promise<GetUserWalletResponse>
  async getUserWallet(uuid: string, currency: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_USER_WALLET_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // : Promise<GetPaymentAddressResponse>
  async getPaymentAddress(uuid: string, currency: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}/addresses`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_PAYMENT_ADDRESS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // : Promise<ValidateAddressResponse>
  async validateAddress(address: string, currency: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/addresses/validate?currency=${currency}&address=${address}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.VALIDATE_ADDRESS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  //  Promise<CreateWithdrawalResponse> {
  async createWithdrawal(uuid: string, dto: any) {
    try {
      return await this.httpService.post(
        `${this.qwalletUrl}/users/${uuid}/withdraw`,
        dto,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.CREATE_WITHDRAWAL_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // : Promise<GetWithdrawalResponse>
  async getWithdrawal(uuid: string, reference: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/withdraw/${reference}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_WITHDRAWAL_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configService.get<string>('QWALLET_SECRET_KEY')}`,
    };
  }
}
