import { AuthErrorEnum } from '@/v1/models/auth-error.enum';
import { KycErrorEnum } from '@/v1/models/kyc-error.enum';
import { UserErrorEnum } from '@/v1/models/user-error.enum';
import { WalletErrorEnum } from '@/v1/models/wallet-manager.types';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    public readonly errorCode:
      | KycErrorEnum
      | UserErrorEnum
      | AuthErrorEnum
      | WalletErrorEnum
      | string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(errorCode, statusCode);
  }
}
