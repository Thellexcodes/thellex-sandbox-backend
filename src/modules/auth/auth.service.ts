import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { Repository } from 'typeorm';
import base64url from 'base64url';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { ConfigService } from '@nestjs/config';
import { VerifyRegistrationDto } from './dto/verify-registeration.dto';
import { VerifyAuthenticationDto } from './dto/verify-auth.dto';
import { AuthErrorEnum } from '@/models/auth-error.enum';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';

@Injectable()
export class AuthnService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authnRepository: Repository<AuthEntity>,

    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,

    private configService: ConfigService,
  ) {}

  async createChallenge(
    user: UserEntity,
  ): Promise<
    (PublicKeyCredentialCreationOptionsJSON & { userId: string }) | any
  > {
    try {
      const rpID = this.configService.get<string>('RP_ID');

      const opts: GenerateRegistrationOptionsOpts = {
        rpName: 'Thellex SandBox',
        rpID,
        userName: user.email,
        timeout: 60000,
        attestationType: 'none',
        excludeCredentials: user.devices.map((cred) => ({
          id: cred.credentialID,
          type: 'public-key',
          transports: cred.transports,
        })),
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required',
        },
      };

      const options = await generateRegistrationOptions(opts);

      const authN = this.authnRepository.create({
        challenge: options.challenge,
        user,
      });

      await this.authnRepository.save(authN);

      return { ...options, userId: user.id };
    } catch (err) {
      console.error(err);
      throw new CustomHttpException(
        AuthErrorEnum.CHALLENGE_CREATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyRegistration(
    user: UserEntity,
    verifyRegistrationDto: VerifyRegistrationDto,
  ) {
    try {
      const rpID = this.configService.get<string>('RP_ID');
      const expectedOrigin = this.configService.get<string>('CLIENT_URL');

      const challenge = await this.authnRepository.findOne({
        where: {
          challenge: verifyRegistrationDto.challenge,
          user: { id: user.id },
        },
        relations: ['user'],
      });

      if (!challenge) {
        throw new CustomHttpException(
          AuthErrorEnum.INVALID_OR_EXPIRED_CHALLENGE,
          HttpStatus.BAD_REQUEST,
        );
      }

      const opts: VerifyRegistrationResponseOpts = {
        response: verifyRegistrationDto.attestationResponse,
        expectedChallenge: `${verifyRegistrationDto.challenge}`,
        expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: false,
      };

      const verificationResult = await verifyRegistrationResponse(opts);

      if (!verificationResult.verified) {
        throw new CustomHttpException(
          AuthErrorEnum.REGISTRATION_VERIFICATION_FAILED,
          HttpStatus.BAD_REQUEST,
        );
      }

      const { registrationInfo } = verificationResult;
      const { id, publicKey, counter } = registrationInfo.credential;

      const device = this.deviceRepository.create({
        user,
        publicKey: Buffer.from(publicKey).toString('base64'),
        credentialID: id,
        count: counter,
        transports:
          verifyRegistrationDto.attestationResponse.response.transports,
        attestationObject: base64url.encode(
          Buffer.from(registrationInfo.attestationObject),
        ),
        attestationResponse: verifyRegistrationDto.attestationResponse,
      });

      // TODO: Delete challenge after successful registration

      await this.deviceRepository.save(device);

      return { message: 'Registration successful' };
    } catch (error) {
      console.error(error);
      throw new CustomHttpException(
        AuthErrorEnum.VERIFICATION_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async authOptions(
    user: UserEntity,
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    try {
      if (!user.devices.length) {
        throw new CustomHttpException(
          AuthErrorEnum.NO_DEVICES_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      const rpID = this.configService.get<string>('RP_ID');

      const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: user.devices.map((cred) => ({
          id: cred.credentialID,
          type: 'public-key',
          transports: cred.transports,
        })),
        userVerification: 'required',
        rpID,
      };

      const options = await generateAuthenticationOptions(opts);

      const authN = this.authnRepository.create({
        challenge: options.challenge,
        user,
      });

      await this.authnRepository.save(authN);

      return options;
    } catch (err) {
      console.error(err);
      throw new CustomHttpException(
        err.message || AuthErrorEnum.AUTHENTICATION_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async authenticate(user: UserEntity, deviceDataDto: VerifyAuthenticationDto) {
    try {
      const rpID = this.configService.get<string>('RP_ID');
      const expectedOrigin = this.configService.get<string>('CLIENT_URL');

      const challenge = await this.authnRepository.findOne({
        where: {
          challenge: deviceDataDto.challenge,
          user: { id: user.id },
        },
        relations: ['user'],
      });

      if (!challenge) {
        throw new CustomHttpException(
          AuthErrorEnum.INVALID_OR_EXPIRED_CHALLENGE,
          HttpStatus.BAD_REQUEST,
        );
      }

      const device = user.devices.find(
        (device) =>
          deviceDataDto.attestationResponse.id === device.credentialID,
      );

      if (!device) {
        throw new CustomHttpException(
          AuthErrorEnum.DEVICE_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      const opts: VerifyAuthenticationResponseOpts = {
        response: deviceDataDto.attestationResponse,
        expectedChallenge: `${deviceDataDto.challenge}`,
        expectedOrigin,
        expectedRPID: rpID,
        credential: {
          id: device.credentialID,
          publicKey: Buffer.from(device.publicKey, 'base64'),
          counter: device.count,
        },
        requireUserVerification: false,
      };

      const verification = await verifyAuthenticationResponse(opts);

      device.count = verification.authenticationInfo.newCounter;
      await this.deviceRepository.save(device);

      // TODO: Delete challenge after successful authentication

      return { message: 'Authentication successful' };
    } catch (err) {
      console.error(err);
      throw new CustomHttpException(
        AuthErrorEnum.AUTHENTICATION_FAILED,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
