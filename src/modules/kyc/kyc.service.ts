import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@/middleware/http.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { KycErrorEnum } from '@/models/kyc-error.enum';
import {
  BvnLookupResponse,
  NinLookupResponse,
  BvnVerificationResponse,
  PhoneNumberLookupResponse,
} from '@/models/identifications.types';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  BasicTierKycDto,
  DocumentAnalysisEntityDto,
  DocumentAnalysisResponse,
  EntityDto,
  KycResultDto,
  UploadDocumentInputTypeEnum,
  ValidateBvnResponseDto,
  VerificationResponseDto,
  VerifySelfieWithPhotoIdDto,
} from './dto/kyc-data.dto';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';
import { getAppConfig } from '@/constants/env';
import {
  calculateNameMatchScore,
  formatUserWithTiers,
  keyByFieldKey,
} from '@/utils/helpers';
import { IdTypeEnum, KycProviderEnum } from '@/models/kyc.types';
import { TierEnum } from '@/config/tier.lists';
import { UserService } from '../users/user.service';
import { plainToInstance } from 'class-transformer';
import { VerifyBvnDto } from './dto/validate-bvn.dto';
import { MapleradService } from '../payments/maplerad.service';
import { BankingNetworkEntity } from '@/utils/typeorm/entities/banking/banking-network.entity';
import { VfdService } from '../payments/vfd.service';
import { CountryEnum } from '@/config/settings';

//TODO: Handle errors with enum
//[x]: Move the Dojah services out
@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(KycEntity)
    private readonly kycRepo: Repository<KycEntity>,
    @InjectRepository(BankingNetworkEntity)
    private readonly bankingNetworkRepo: Repository<BankingNetworkEntity>,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly vfdService: VfdService,
    private readonly dataSource: DataSource,
  ) {}

  async createBasicKyc(
    kydataDto: BasicTierKycDto,
    user: UserEntity,
  ): Promise<KycResultDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      const matchThreshold = 0.5;

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
        idNumber: kydataDto.nin,
        bvn: kydataDto.bvn,
        user,
        firstName: ninResponse?.entity?.first_name ?? kydataDto.firstName,
        middleName: kydataDto?.middleName,
        lastName: ninResponse?.entity?.last_name ?? kydataDto.lastName,
        dob: ninResponse?.entity?.date_of_birth ?? kydataDto.dob,
        idTypes: [IdTypeEnum.BVN, IdTypeEnum.NIN],
        houseNumber: kydataDto.houseNumber,
        streetName: kydataDto.streetName,
        state: kydataDto.state,
        country: 'Nigeria' as CountryEnum,
        lga: kydataDto.lga,
        provider: KycProviderEnum.DOJAH,
        phone: `${kydataDto.phoneNumber}`,
      };

      // Create KycEntity with queryRunner.manager
      const kycRecord = queryRunner.manager.create(KycEntity, userKycData);
      await queryRunner.manager.save(kycRecord);

      // Update user tier also via queryRunner.manager
      await this.updateUserTierWithManager(
        queryRunner.manager,
        user.id,
        TierEnum.BASIC,
      );

      // Use updated user data from the main service, outside transaction
      const updatedUser = await this.userService.findOneById(user.id);

      // Format dob string for mapleRad
      // const dobParts = kydataDto.dob.split('-');
      // const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
      // const country = kydataDto.country?.toUpperCase() || 'NG';

      // const mapleRadCustomerInfo = {
      //   first_name: savedKycRecord.firstName,
      //   last_name: savedKycRecord.lastName,
      //   email: savedKycRecord.user.email,
      //   country,
      //   identification_number: kydataDto.bvn,
      //   dob: formattedDob,
      //   phone: {
      //     phone_country_code: kydataDto.phone.phone_country_code,
      //     phone_number: kydataDto.phone.phone_number,
      //   },
      //   identity: {
      //     type: userKycData.idTypes[1],
      //     image: 'https://example.com/image',
      //     number: kydataDto.nin,
      //     country,
      //   },
      //   address: {
      //     street: kydataDto.streetName,
      //     street2: null,
      //     city: kydataDto.city,
      //     state: kydataDto.state,
      //     country,
      //     postal_code: kydataDto.postal_code,
      //   },
      // };

      // const enrolledCustomerResponse =
      //   await this.mapleradService.enrollCustomer(mapleRadCustomerInfo);

      // const enrolledCustomer = enrolledCustomerResponse.data;
      // const bankingNetwork = queryRunner.manager.create(BankingNetworkEntity, {
      //   external_customer_id: enrolledCustomer.id,
      //   first_name: enrolledCustomer.first_name,
      //   last_name: enrolledCustomer.last_name,
      //   email: enrolledCustomer.email,
      //   country: enrolledCustomer.country,
      //   status: enrolledCustomer.status,
      //   tier: enrolledCustomer.tier,
      //   external_created_at: enrolledCustomer.created_at,
      //   external_updated_at: enrolledCustomer.updated_at,
      //   provider: BankingNetworkProviderEnum.MAPLERAD,
      //   user,
      // });

      // await queryRunner.manager.save(bankingNetwork);

      // const createAccountResponse =
      //   await this.mapleradService.createBankingAccount({
      //     customer_id: enrolledCustomer.id,
      //     currency: 'NGN',
      //     preferred_bank:
      //       this.configService.getRaw('NODE_ENV') !== ENV_PRODUCTION
      //         ? ''
      //         : '824',
      //   });

      // const bankAccountInfo = queryRunner.manager.create(BankAccountEntity, {
      //   user,
      //   external_customer_id: createAccountResponse.data.id,
      //   bankName: createAccountResponse.data.bank_name,
      //   accountName: createAccountResponse.data.account_name,
      //   accountNumber: createAccountResponse.data.account_number,
      //   iban: createAccountResponse.data.account_number,
      //   external_createdAt: createAccountResponse.data.created_at,
      // });

      // await queryRunner.manager.save(bankAccountInfo);

      await queryRunner.commitTransaction();

      const { nextTier, currentTier, banks } = formatUserWithTiers(updatedUser);

      return plainToInstance(
        KycResultDto,
        { isVerified: true, currentTier, nextTier, banks },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction rollback due to:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateUserTierWithManager(
    manager: EntityManager,
    userId: string,
    tier: TierEnum,
  ): Promise<void> {
    await manager.update(UserEntity, { id: userId }, { tier });
  }

  cleanDateString(dateStr: string): string {
    // Extract up to milliseconds (.xxx)
    return dateStr.replace(/(\.\d{3})\d+Z$/, '$1Z');
  }

  async lookupNIN(nin: number): Promise<NinLookupResponse> {
    try {
      const ninCheckerResponse = await this.httpService.get<NinLookupResponse>(
        `${this.dojahUrl}/api/v1/kyc/nin`,
        {
          headers: {
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
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
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
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
              AppId: getAppConfig().DOJAH.APP_ID,
              Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
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
  async validateBVN(
    userId: string,
    dto: VerifyBvnDto,
  ): Promise<ValidateBvnResponseDto> {
    try {
      const response = await this.httpService.get<BvnVerificationResponse>(
        `${this.dojahUrl}/api/v1/kyc/bvn`,
        {
          headers: {
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
          },
          params: { bvn: dto.bvn },
        },
      );

      const isValid = response.entity?.bvn?.status ?? false;

      if (!isValid) {
        this.logger.warn(
          `BVN validation failed for user ${userId}: Invalid BVN ${dto.bvn}`,
        );
        return { isValid };
      }

      const userKycRecord = await this.getUserKyc(userId);
      if (!userKycRecord) {
        this.logger.warn(`No KYC record found for user ${userId}`);
        return { isValid };
      }

      // Update KYC record
      userKycRecord.bvn = String(dto.bvn);
      userKycRecord.phone = dto.phoneNumber.fullPhone;
      if (!userKycRecord.idTypes.includes(IdTypeEnum.BVN)) {
        userKycRecord.idTypes = [...userKycRecord.idTypes, IdTypeEnum.BVN];
        this.logger.log(
          `Added BVN to idTypes for user ${userId}: ${userKycRecord.idTypes}`,
        );
      } else {
        this.logger.log(
          `BVN already in idTypes for user ${userId}: ${userKycRecord.idTypes}`,
        );
      }

      await this.kycRepo.save(userKycRecord);
      this.logger.log(`Saved KYC record for user ${userId}`);

      return { isValid };
    } catch (error) {
      this.logger.error(
        `BVN validation failed for user ${userId}: ${error.message}`,
        error.stack,
      );
    }
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
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
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
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
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

  // Simulate external document analysis API call
  async handleDocumentAnalysis(
    input_type: UploadDocumentInputTypeEnum,
    frontBase64: string,
    backBase64?: string,
  ): Promise<DocumentAnalysisEntityDto> {
    try {
      const payload: Record<string, any> = {
        input_type,
        imagefrontside: frontBase64,
      };

      if (backBase64) {
        payload.imagebackside = backBase64;
      }

      const response$: DocumentAnalysisResponse = await this.httpService.post(
        `${this.dojahUrl}/api/v1/document/analysis`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
          },
        },
      );

      return response$.entity;
    } catch (error: any) {
      console.log(error);
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
        `${KycErrorEnum.INTERNAL_ERROR}-${error.response?.data?.error || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // return {
    //   status: 'ANALYZED',
    //   document_type: 'passport',
    //   front_image_base64: frontBase64,
    //   back_image_base64: backBase64,
    // };
  }

  // Simulate external selfie + photoID verification API call
  async handleSelfieVerification(
    payload: Partial<VerifySelfieWithPhotoIdDto>,
  ): Promise<EntityDto> {
    try {
      const response$: VerificationResponseDto = await this.httpService.post(
        `${this.dojahUrl}/api/v1/kyc/photoid/verify`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            AppId: getAppConfig().DOJAH.APP_ID,
            Authorization: getAppConfig().DOJAH.AUTH_PRIVATE_KEY,
          },
        },
      );
      return response$.entity;
    } catch (error: any) {
      throw new CustomHttpException(
        `${KycErrorEnum.INTERNAL_ERROR}-${error.response?.data?.error || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createBasicSelfieWithPhotoKyc(
    user: UserEntity,
    dto: VerifySelfieWithPhotoIdDto,
  ): Promise<any> {
    try {
      const selfieBase64 = this.stripBase64Prefix(dto.selfie_image);
      const photoIdBase64 = this.stripBase64Prefix(dto.photoid_image);

      const analysis = await this.handleDocumentAnalysis(
        UploadDocumentInputTypeEnum.Base64,
        photoIdBase64,
      );

      const keyed = keyByFieldKey(analysis.text_data);

      const result = await this.handleSelfieVerification({
        selfie_image: selfieBase64,
        photoid_image: photoIdBase64,
      });

      if (!(result.selfie.match && result.selfie.confidence_value > 70))
        throw new CustomHttpException(
          KycErrorEnum.KYC_LOOKUP_FAILED,
          HttpStatus.FORBIDDEN,
        );

      const documentNumber = keyed['document_number']?.value || null;
      const country =
        keyed['nationality']?.value ||
        keyed['issuing_state_name']?.value ||
        null;

      const firstName = keyed['first_name']?.value || null;
      const lastName = keyed['last_name']?.value || null;
      const dob = keyed['dob']?.value || '';

      const userKycData: Partial<KycEntity> = {
        user,
        firstName,
        lastName,
        dob,
        idTypes: [result.selfie.card_type],
        idNumber: documentNumber,
        country,
        provider: KycProviderEnum.DOJAH,
      };

      await this.kycRepo.save(userKycData);
      await this.userService.updateUserTier(user.id, TierEnum.BASIC);
      const updatedUser = await this.userService.findOneById(user.id);

      const { currentTier, nextTier, remainingTiers, outstandingKyc, banks } =
        formatUserWithTiers(updatedUser);

      return plainToInstance(
        KycResultDto,
        {
          isVerified: true,
          currentTier,
          nextTier,
          outstandingKyc,
          remainingTiers,
          banks,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      console.log(error);
      throw error instanceof CustomHttpException
        ? error
        : new CustomHttpException(
            KycErrorEnum.KYC_LOOKUP_FAILED,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  private get dojahUrl(): string {
    return getAppConfig().DOJAH.API;
  }

  private stripBase64Prefix(data: string) {
    return data.replace(/^data:image\/\w+;base64,/, '');
  }
}
