import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'superadmin') {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Access denied. Superadmin only.',
        errorCode: 'FORBIDDEN_SUPERADMIN_ONLY',
      });
    }

    return true;
  }
}
