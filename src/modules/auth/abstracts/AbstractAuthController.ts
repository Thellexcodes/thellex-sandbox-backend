import { CustomRequest, CustomResponse } from '@/models/request.types';
import { VerifyRegistrationDto } from '../dto/verify-registeration.dto';
import { VerifyAuthenticationDto } from '../dto/verify-auth.dto';

export abstract class AbstractAuthController {
  /**
   * Create a new user registration challenge.
   * @param req The authenticated client request.
   * @param res The custom response object.
   */
  abstract create(req: CustomRequest, res: CustomResponse): Promise<void>;

  /**
   * Verify the user’s registration response.
   * @param verifyRegistationDto The registration verification data.
   * @param req The authenticated client request.
   * @param res The custom response object.
   */
  abstract verifyChallenge(
    verifyRegistationDto: VerifyRegistrationDto,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Initiate an authentication challenge.
   * @param req The authenticated client request.
   * @param res The custom response object.
   */
  abstract authOptions(req: CustomRequest, res: CustomResponse): Promise<void>;

  /**
   * Verify the authentication response.
   * @param body The authentication verification payload.
   * @param req The authenticated client request.
   * @param res The custom response object.
   */
  abstract verifyAuth(
    body: VerifyAuthenticationDto,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;
}
