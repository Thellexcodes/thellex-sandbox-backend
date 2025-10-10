// src/common/modules/jwt/jwt.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConfigurations } from 'src/config/jwt.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        ...jwtConfigurations(),
      }),
    }),
  ],
  exports: [JwtModule],
})
export class GlobalJwtModule {}
