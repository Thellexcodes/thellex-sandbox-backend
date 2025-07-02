import { BaseResponseDto } from '@/models/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The email of the user', type: String })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Email must match a valid format',
  })
  email: string;
}

export class AccessTokenResultDto {
  @Expose()
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;
}

export class AccessResponseDto extends BaseResponseDto<AccessTokenResultDto> {
  @ApiProperty({ type: AccessTokenResultDto })
  result: AccessTokenResultDto;
}
