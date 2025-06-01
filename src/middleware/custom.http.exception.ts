import { AuthErrorEnum } from '@/types/auth-error.enum';
import { KycErrorEnum } from '@/types/kyc-error.enum';
import { UserErrorEnum } from '@/types/user-error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    public readonly errorCode:
      | KycErrorEnum
      | UserErrorEnum
      | AuthErrorEnum
      | string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(errorCode, statusCode);
  }
}
