import { Controller } from '@nestjs/common';
import { TokenService } from './token.service';
import { VersionedController001 } from '../controller/base.controller';

@VersionedController001('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
}
