import { RoleEnum } from '@/v1/models/roles-actions.enum';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { CustomHttpException } from '../custom.http.exception';
import { UserErrorEnum } from '@/v1/models/user-error.enum';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== RoleEnum.SUPER_ADMIN) {
      throw new CustomHttpException(
        UserErrorEnum.FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
