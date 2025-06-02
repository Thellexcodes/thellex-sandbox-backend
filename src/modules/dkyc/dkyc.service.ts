import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@/middleware/http.service';
import { DOJAH_KYC_API } from '@/constants/env';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { KycErrorEnum } from '@/types/kyc-error.enum';
import {
  BvnLookupResponse,
  NinLookupResponse,
  PhoneNumberLookupResponse,
} from '@/types/identifications.types';
import { InjectRepository } from '@nestjs/typeorm';
import { DKycEntity } from '@/utils/typeorm/entities/dkyc.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { BasicTierKycDto } from './dto/create-tier1-dkyc.dto';

@Injectable()
export class DkycService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(DKycEntity)
    private readonly dkycRepo: Repository<DKycEntity>,
  ) {}

  private get dojahUrl(): string {
    const env = this.configService.get<string>('NODE_ENV');
    return env === 'testnet' ? DOJAH_KYC_API.sandbox : DOJAH_KYC_API.production;
  }

  async createBasicKyc(basicTierKycDto: BasicTierKycDto, user: UserEntity) {
    const record = await this.dkycRepo.findOne({
      where: { user: { id: user.id }, ninVerified: true },
    });
    //[x] Properly queue later

    //Lookup Nin
    const nin = await this.lookupNIN(basicTierKycDto.nin);

    // Lookup Bvn
    const bvn = await this.lookupBVN(basicTierKycDto.nin);

    if (!record) {
      await this.dkycRepo.save({
        user: { id: user.id },
        ninVerified: true,
      });
    }
  }

  async lookupNIN(nin: number): Promise<NinLookupResponse> {
    try {
      const ninCheckerResponse: NinLookupResponse = await this.httpService.get(
        `${this.dojahUrl}/api/v1/kyc/nin`,
        {
          headers: {
            AppId: this.configService.get<string>('DOJAH_APPID'),
            Authorization: `${this.configService.get<string>('DOJAH_AUTHORIZATION_PUBLIC_KEY')}`,
          },
          params: { nin },
        },
      );

      return ninCheckerResponse;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new CustomHttpException(
          KycErrorEnum.NIN_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.response?.status === 400) {
        throw new CustomHttpException(
          KycErrorEnum.INVALID_NIN,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        `${KycErrorEnum.INTERNAL_ERROR}-${error.response.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async lookupBVN(bvn: number): Promise<BvnLookupResponse> {
    try {
      const bvnCheckerResponse: BvnLookupResponse = await this.httpService.get(
        `${this.dojahUrl}/api/v1/kyc/bvn/full`,
        {
          headers: {
            AppId: this.configService.get<string>('DOJAH_APPID'),
            Authorization: `${this.configService.get<string>('DOJAH_AUTHORIZATION_PUBLIC_KEY')}`,
          },
          params: { bvn },
        },
      );

      return bvnCheckerResponse;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new CustomHttpException(
          KycErrorEnum.BVN_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.response?.status === 400) {
        throw new CustomHttpException(
          KycErrorEnum.INVALID_BVN,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        `${KycErrorEnum.INTERNAL_ERROR}-${error.response.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async lookupPhoneNumber(
    phone_number: string,
  ): Promise<PhoneNumberLookupResponse> {
    try {
      const phoneCheckerResponse: PhoneNumberLookupResponse =
        await this.httpService.get(
          `${this.dojahUrl}/api/v1/kyc/phone_number/basic`,
          {
            headers: {
              AppId: this.configService.get<string>('DOJAH_APPID'),
              Authorization: `${this.configService.get<string>('DOJAH_AUTHORIZATION_PUBLIC_KEY')}`,
            },
            params: { phone_number },
          },
        );

      return phoneCheckerResponse;
    } catch (err) {}
  }

  async lookupNubanKycStatus(nuban: string): Promise<any> {}

  // Global Identity Verification
  async verifySelfiePhotoId(
    userId: string,
    photoIdData: any,
  ): Promise<boolean> {
    // Implement selfie photo ID verification logic here
    return true;
  }

  async locationReverseGeocoding(lat: number, lng: number): Promise<string> {
    // Implement reverse geocoding to get location from lat/lng
    return 'Location info';
  }

  // Nigeria specific verifications
  async validateBVN(bvn: string): Promise<boolean> {
    // Implement BVN validation logic here
    return true;
  }

  async verifyNINWithSelfie(nin: string, selfieImage: any): Promise<boolean> {
    // Implement NIN verification using selfie image
    return true;
  }

  async verifyBVNWithSelfie(bvn: string, selfieImage: any): Promise<boolean> {
    // Implement BVN verification using selfie image
    return true;
  }

  async ageIdentityVerification(
    userId: string,
    dateOfBirth: string,
  ): Promise<boolean> {
    // Verify user's age and identity
    return true;
  }

  async selfieVerificationVNIN(
    selfieImage: any,
    nin: string,
  ): Promise<boolean> {
    // Biometric check between selfie and NIN
    return true;
  }

  // Biometric Checks
  async livenessCheck(selfieVideo: any): Promise<boolean> {
    // Implement liveness check to prevent spoofing
    return true;
  }

  // AML Screening
  async amlScreeningIndividual(userId: string): Promise<boolean> {
    // Implement AML screening for individuals
    return true;
  }

  async amlScreeningBusiness(businessId: string): Promise<boolean> {
    // Implement AML screening for businesses
    return true;
  }

  async amlScreeningDetails(userId: string): Promise<any> {
    // Return detailed AML screening info
    return {};
  }

  async userScreening(userId: string): Promise<boolean> {
    // General user screening
    return true;
  }

  async ipScreening(ipAddress: string): Promise<boolean> {
    // Screen user IP for risk
    return true;
  }

  async emailCheck(email_address: string): Promise<boolean> {
    try {
      const emailCheckerResponse: boolean = await this.httpService.get(
        `${this.dojahUrl}/api/v1/fraud/email`,
        {
          headers: {
            AppId: this.configService.get<string>('DOJAH_APPID'),
            Authorization: `${this.configService.get<string>('DOJAH_AUTHORIZATION_PUBLIC_KEY')}`,
          },
          params: { email_address },
        },
      );
      return emailCheckerResponse;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new CustomHttpException(
          KycErrorEnum.EMAIL_CHECK_FAILED,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.response?.status === 400) {
        throw new CustomHttpException(
          KycErrorEnum.EMAIL_CHECK_FAILED,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        `${KycErrorEnum.INTERNAL_ERROR}-${error.response.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async phoneCheck(phone_number: string): Promise<boolean> {
    try {
      const phoneCheckerResponse: boolean = await this.httpService.get(
        `${this.dojahUrl}/api/v1/fraud/phone`,
        {
          headers: {
            AppId: this.configService.get<string>('DOJAH_APPID'),
            Authorization: `${this.configService.get<string>('DOJAH_AUTHORIZATION_PUBLIC_KEY')}`,
          },
          params: { phone_number },
        },
      );

      //TODO: Ensure phone is among list of supported countries

      return phoneCheckerResponse;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new CustomHttpException(
          KycErrorEnum.PHONE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.response?.status === 400) {
        throw new CustomHttpException(
          KycErrorEnum.PHONE_CHECK_FAILED,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        `${KycErrorEnum.INTERNAL_ERROR}-${error.response.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
