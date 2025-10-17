// src/common/modules/jwt/jwt.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConfigurations } from 'src/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '@/utils/typeorm/typeOrm.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        ...jwtConfigurations(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => await typeOrmConfig(),
      inject: [],
    }),
  ],
  exports: [JwtModule, TypeOrmModule],
})
export class GlobalJwtModule {}
