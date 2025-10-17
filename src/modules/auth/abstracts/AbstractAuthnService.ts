import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';
import { VerifyRegistrationDto } from '../dto/verify-registeration.dto';
import { VerifyAuthenticationDto } from '../dto/verify-auth.dto';

/**
 * Abstract service defining the contract for WebAuthn authentication and registration logic.
 * This class should be extended by concrete implementations (e.g., AuthnService)
 * to handle registration, verification, and authentication processes.
 */
export abstract class AbstractAuthnService {
  /**
   * Creates a WebAuthn registration challenge for the specified user.
   * @param user The user initiating the registration.
   * @returns The WebAuthn public key creation options and user ID.
   */
  abstract createChallenge(
    user: UserEntity,
  ): Promise<
    (PublicKeyCredentialCreationOptionsJSON & { userId: string }) | any
  >;

  /**
   * Verifies a WebAuthn registration response from the client.
   * @param user The user performing registration.
   * @param verifyRegistrationDto The registration verification payload.
   * @returns A success message or result object.
   */
  abstract verifyRegistration(
    user: UserEntity,
    verifyRegistrationDto: VerifyRegistrationDto,
  ): Promise<{ message: string }>;

  /**
   * Generates authentication options (login challenge) for the user's existing devices.
   * @param user The user attempting authentication.
   * @returns The WebAuthn public key request options.
   */
  abstract authOptions(
    user: UserEntity,
  ): Promise<PublicKeyCredentialRequestOptionsJSON>;

  /**
   * Verifies an authentication (login) response from the client.
   * @param user The user being authenticated.
   * @param deviceDataDto The authentication response payload.
   * @returns A success message or result object.
   */
  abstract authenticate(
    user: UserEntity,
    deviceDataDto: VerifyAuthenticationDto,
  ): Promise<{ message: string }>;
}
