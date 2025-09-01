import { getAppConfig } from '@/v1/constants/env';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfigurations = (): JwtModuleOptions => {
  return {
    secret: getAppConfig().AUTH_JWT_SECRET,
    signOptions: { expiresIn: '30d' },
  };
};

export interface JwtPayload {
  id: string;
}
