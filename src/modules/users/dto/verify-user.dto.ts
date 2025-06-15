import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserDto {
  @ApiProperty()
  code: number;
}
