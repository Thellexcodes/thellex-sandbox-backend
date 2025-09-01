import { BaseResponseDto } from '@/v1/models/base-response.dto';
import { UserErrorEnum } from '@/v1/models/user-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The email of the user', type: String })
  @IsEmail({}, { message: UserErrorEnum.INVALID_EMAIL_FORMAT })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: UserErrorEnum.INVALID_EMAIL_FORMAT,
  })
  email: string;
}

export class AccessTokenResultDto {
  @Expose()
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token string used for authentication',
  })
  access_token: string;

  @Expose()
  @ApiProperty({
    example: '2025-07-02T15:30:00.000Z',
    description:
      'Expiration date and time of the access token in ISO 8601 format',
    type: 'string',
    format: 'date-time',
  })
  expires_at: Date;
}

export class AccessResponseDto extends BaseResponseDto<AccessTokenResultDto> {
  @ApiProperty({ type: AccessTokenResultDto })
  result: AccessTokenResultDto;
}
