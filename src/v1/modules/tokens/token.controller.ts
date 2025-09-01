import { Controller } from '@nestjs/common';
import { TokenService } from './token.service';
import { VersionedController101 } from '../controller/base.controller';

@VersionedController101('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
}
