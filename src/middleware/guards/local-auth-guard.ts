import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtConfigurations } from 'src/config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const access_token = this.extractTokenFromHeader(request);

    if (!access_token)
      throw new UnauthorizedException('Unauthorized. Please login');

    const { id } = await this.jwtService.verifyAsync(access_token, {
      secret: jwtConfigurations(this.configService).secret,
    });

    if (!id) {
      throw new UnauthorizedException('Unauthorized. Please login');
    }

    const user = await this.userService.findOneById(id);

    if (!user) {
      throw new UnauthorizedException('Unauthorized. Please login');
    }

    // if (user.suspended) {
    //   throw new UnauthorizedException('You account is currently suspended.');
    // }

    const { password, ...userData } = user;

    request.user = userData;

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
