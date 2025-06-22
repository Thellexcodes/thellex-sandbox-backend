import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@/middleware/http.service';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { KycErrorEnum } from '@/models/kyc-error.enum';
import {
  BvnLookupResponse,
  NinLookupResponse,
  PhoneNumberLookupResponse,
} from '@/models/identifications.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { BasicTierKycDto } from './dto/kyc-data.dto';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';
import { getAppConfig } from '@/constants/env';
import { calculateNameMatchScore } from '@/utils/helpers';
import { IdTypeEnum, KycProviderEnum } from '@/models/kyc.types';
import { TierEnum } from '@/constants/tier.lists';
import { UserService } from '../users/user.service';

//TODO: Handle errors with enum
@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycEntity)
    private readonly kycRepo: Repository<KycEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  private get dojahUrl(): string {
    return getAppConfig().DOJAH.API;
  }

  async createBasicKyc(
    kydataDto: BasicTierKycDto,
    user: UserEntity,
  ): Promise<boolean> {
    try {
      if (user.tier !== TierEnum.NONE) {
        throw new CustomHttpException(
          KycErrorEnum.KYC_ALREADY_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      let ninResponse: NinLookupResponse | undefined;
      let bvnResponse: BvnLookupResponse | undefined;

      if (kydataDto.nin) {
        ninResponse = await this.lookupNIN(Number(kydataDto.nin));
        if (!ninResponse?.entity) {
          throw new CustomHttpException(
            KycErrorEnum.NIN_NOT_FOUND,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (kydataDto.bvn) {
        bvnResponse = await this.lookupBVN(Number(kydataDto.bvn));
        if (!bvnResponse?.entity) {
          throw new CustomHttpException(
            KycErrorEnum.BVN_NOT_FOUND,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const matchThreshold = 0.4;

      if (ninResponse?.entity) {
        const firstNameScore = calculateNameMatchScore(
          kydataDto.firstName,
          ninResponse.entity.first_name,
        );

        if (firstNameScore < matchThreshold) {
          throw new CustomHttpException(
            KycErrorEnum.NAME_MISMATCH,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (bvnResponse?.entity) {
        const lastNameScore = calculateNameMatchScore(
          kydataDto.lastName,
          bvnResponse.entity.last_name,
        );

        if (lastNameScore < matchThreshold) {
          throw new CustomHttpException(
            KycErrorEnum.NAME_MISMATCH,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const userKycData: Partial<KycEntity> = {
        nin: kydataDto.nin,
        bvn: kydataDto.bvn,
        user,
        firstName: ninResponse?.entity?.first_name ?? kydataDto.firstName,
        middleName: kydataDto?.middleName,
        lastName: ninResponse?.entity?.last_name ?? kydataDto.lastName,
        dob: ninResponse?.entity.date_of_birth ?? kydataDto.dob,
        idTypes: [IdTypeEnum.BVN, IdTypeEnum.NIN],
        houseNumber: kydataDto.houseNumber,
        streetName: kydataDto.streetName,
        state: kydataDto.state,
        lga: kydataDto.lga,
        provider: KycProviderEnum.DOJAH,
      };

      const kycRecord = this.kycRepo.create(userKycData);

      await this.kycRepo.save(kycRecord);

      await this.userService.updateUserTier(user.id, TierEnum.BASIC);

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  async lookupNIN(nin: number): Promise<NinLookupResponse> {
    try {
      const ninCheckerResponse = await this.httpService.get<NinLookupResponse>(
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

  async getUserKyc(userId: string): Promise<KycEntity | null> {
    return await this.kycRepo.findOne({
      where: { user: { id: userId } },
    });
  }
}
