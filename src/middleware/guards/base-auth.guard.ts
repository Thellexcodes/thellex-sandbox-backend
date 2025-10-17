import { jwtConfigurations } from '@/config/jwt.config';
import { AuthErrorEnum } from '@/models/auth-error.enum';
import { UserService } from '@/modules/users/v1/user.service';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export abstract class BaseAuthGuard implements CanActivate {
  constructor(
    protected readonly userService: UserService,
    protected readonly jwtService: JwtService,
  ) {}

  protected fetchUser?(id: string): Promise<UserEntity | null>;
  protected ensureUserCanPerformKyc?(id: string): Promise<boolean>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const access_token = this.extractTokenFromHeader(request);

    if (!access_token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
        errorCode: AuthErrorEnum.UNAUTHORIZED,
      });
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(access_token, {
        secret: jwtConfigurations().secret,
      });
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired token',
        errorCode: AuthErrorEnum.INVALID_TOKEN,
      });
    }

    const { id } = payload;

    if (!id) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid token payload',
        errorCode: AuthErrorEnum.UNAUTHORIZED,
      });
    }

    const user = await this.fetchUser(id);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'User account no longer exists',
        errorCode: AuthErrorEnum.USER_NOT_FOUND,
      });
    }

    if (user.suspended) {
      throw new UnauthorizedException({
        statusCode: 403,
        message: 'Your account is currently suspended',
        errorCode: AuthErrorEnum.USER_SUSPENDED,
      });
    }

    const { password, ...userData } = user;
    request.user = userData;

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
