import { AuthnEntity } from '@/utils/typeorm/entities/authn.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Repository } from 'typeorm';
import { VerifyRegistationDto } from './dto/verify-registeration.dto';
import base64url from 'base64url';

@Injectable()
export class AuthnService {
  constructor(
    @InjectRepository(AuthnEntity)
    private readonly authnRepository: Repository<AuthnEntity>,
  ) {}

  async createChallenge(
    user: UserEntity,
  ): Promise<PublicKeyCredentialCreationOptionsJSON & { userId: string }> {
    const options = await generateRegistrationOptions({
      rpName: 'My App',
      rpID: 'localhost',
      userID: new Uint8Array(Buffer.from(user.id, 'utf8')),
      userName: user.email,
      attestationType: 'none',
    });

    // Create new AuthnEntity
    const authN = new AuthnEntity();
    authN.challenge = options.challenge;
    authN.user = user;

    // Save the challenge
    await this.authnRepository.save(authN);

    return { ...options, userId: user.id };
  }

  async verifyRegistration(
    user: UserEntity,
    verifyRegistationDto: VerifyRegistationDto,
  ) {
    try {
      const challenge = await this.authnRepository.findOne({
        where: {
          challenge: verifyRegistationDto.challenge,
          user: { id: user.id },
        },
        relations: ['user'],
      });

      const verification = await verifyRegistrationResponse({
        response: verifyRegistationDto.attestationResponse,
        expectedChallenge: challenge.challenge,
        expectedOrigin: 'http://localhost:3000', //[x] update to env later
        expectedRPID: 'localhost',
      });

      if (verification.verified) {
        // const { credentialID, credentialPublicKey } =
        //   verification.registrationInfo;
        //   console.log(base64url(credentialPublicKey))
        //
        //   db.users[userId].devices.push({
        //     credentialID: base64url(credentialID),
        //     publicKey: base64url(credentialPublicKey),
        //     transports: attestationResponse.transports || [],
        //     counter: 0,
        //   });
      }
      // res.status(400).json({ success: false, message: 'Verification failed' });
    } catch (error) {
      console.error(error);
    }
  }
}
