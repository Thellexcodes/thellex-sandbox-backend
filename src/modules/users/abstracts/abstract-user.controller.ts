import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { VerifyUserDto } from '../dto/verify-user.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';

export abstract class AbstractUserController {
  protected constructor() {}

  // /**
  //  * Create a new user or return an access token for an existing one.
  //  */
  // abstract create(
  //   createUserDto: CreateUserDto,
  //   req: CustomRequest,
  //   res: CustomResponse,
  // ): Promise<void>;

  // /**
  //  * Authenticate a user via token login.
  //  */
  // abstract tokenLogin(req: CustomRequest, res: CustomResponse): Promise<void>;

  /**
   * Verify user account (e.g., OTP verification).
   */
  abstract verify(
    verifyUserDto: VerifyUserDto,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  // /**
  //  * Retrieve paginated list of user transactions.
  //  */
  // abstract transactions(
  //   req: CustomRequest,
  //   res: CustomResponse,
  //   query: { page?: string; limit?: string },
  // ): Promise<void>;

  // /**
  //  * Retrieve paginated list of user ramp transactions (on/off-ramp).
  //  */
  // abstract rampTransactions(
  //   req: CustomRequest,
  //   res: CustomResponse,
  //   query: { page?: string; limit?: string },
  // ): Promise<void>;

  // /**
  //  * Retrieve paginated list of user notifications.
  //  */
  // abstract notifications(
  //   req: CustomRequest,
  //   res: CustomResponse,
  //   query: { page?: string; limit?: string },
  // ): Promise<void>;
}
