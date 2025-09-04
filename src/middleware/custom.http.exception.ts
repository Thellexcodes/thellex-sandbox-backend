import { AuthErrorEnum } from '@/models/auth-error.enum';
import { KycErrorEnum } from '@/models/kyc-error.enum';
import { UserErrorEnum } from '@/models/user-error.enum';
import { WalletErrorEnum } from '@/models/wallet-manager.types';
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
