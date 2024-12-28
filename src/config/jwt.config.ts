import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfigurations = (
  configService: ConfigService,
): JwtModuleOptions => {
  return {
    secret: configService.get<string>('AUTH_JWT_SECRET'),
    signOptions: {
      expiresIn: '30d',
    },
  };
};

export interface JwtPayload {
  id: string;
}
