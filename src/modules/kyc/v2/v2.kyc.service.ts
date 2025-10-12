import { HttpStatus, Injectable } from '@nestjs/common';
import { KycService } from '../v1/kyc.service';
import { BaseKycService } from './abstracts/abstract.kyc.service';
import {
  BasicTierKycDto,
  KycResultDto,
  VerifySelfieWithPhotoIdDto,
} from '../dto/kyc-data.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { DataSource } from 'typeorm';
import {
  BvnLookupResponse,
  NinLookupResponse,
} from '@/models/identifications.types';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { calculateNameMatchScore, formatUserWithTiers } from '@/utils/helpers';
import { KycErrorEnum } from '@/models/kyc-error.enum';
import { KycEntity } from '@/utils/typeorm/entities/kyc/kyc.entity';
import { IdTypeEnum, KycProviderEnum } from '@/models/kyc.types';
import { CountryEnum } from '@/config/settings';
import { TierEnum } from '@/config/tier.lists';
import { UserService } from '@/modules/users/user.service';
import { plainToInstance } from 'class-transformer';
import { VfdService } from '@/modules/payments/v2/vfd.service';

//[x] move all v1 to v2 after version enforcement
/**
 * KYC Service V2 — builds on top of KYC V1 functionality.
 */
@Injectable()
export class KycServiceV2 extends BaseKycService {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly kycV1Service: KycService,
    protected readonly userService: UserService,
    protected readonly vfdService: VfdService,
  ) {
    super(dataSource, kycV1Service, userService, vfdService);
  }

  /**
   * Create KYC using either BVN/NIN or Passport details.
   */
  async createKycWithBvnOrNin(kydataDto: BasicTierKycDto, user: UserEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let ninResponse: NinLookupResponse | undefined;
      let bvnResponse: BvnLookupResponse | undefined;

      if (kydataDto.nin) {
        ninResponse = await this.kycV1Service.lookupNIN(Number(kydataDto.nin));
        if (!ninResponse?.entity) {
          throw new CustomHttpException(
            KycErrorEnum.NIN_NOT_FOUND,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (kydataDto.bvn) {
        bvnResponse = await this.kycV1Service.lookupBVN(Number(kydataDto.bvn));
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
      await this.kycV1Service.updateUserTierWithManager(
        queryRunner.manager,
        user.id,
        TierEnum.BASIC,
      );

      // Use updated user data from the main service, outside transaction
      const updatedUser = await this.userService.findOne({
        id: user.id,
        relations: 'kyc',
      });

      // const [year, month, day] = userKycData.dob.split('-');
      // const dob = `${day}-${month}-${year}`;

      // const vfdBankAccountInfo =
      //   await this.vfdService.createIndividualClientWithBvn({
      //     bvn: kydataDto.bvn,
      //     dob,
      //   });

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

  /**
   * Create KYC using internal passport + passport photo.
   */
  async createKycWithPassport(
    user: UserEntity,
    dto: VerifySelfieWithPhotoIdDto,
  ) {
    return await this.kycV1Service.createBasicSelfieWithPhotoKyc(user, dto);
  }
}
