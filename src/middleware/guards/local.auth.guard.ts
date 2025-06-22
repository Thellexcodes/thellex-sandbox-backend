import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtConfigurations } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/users/user.service';
import { AuthErrorEnum } from '@/models/auth-error.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const access_token = this.extractTokenFromHeader(request);

    console.log({ access_token });

    if (!access_token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized. Please login',
        errorCode: AuthErrorEnum.UNAUTHORIZED,
      });
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(access_token, {
        secret: jwtConfigurations().secret,
      });
    } catch (err) {
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

    const user = await this.userService.findOneById(id);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'User account no longer exists. It may have been deleted.',
        errorCode: AuthErrorEnum.USER_NOT_FOUND,
      });
    }

    if (user.suspended) {
      throw new UnauthorizedException({
        statusCode: 403,
        message: 'Your account is currently suspended.',
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
