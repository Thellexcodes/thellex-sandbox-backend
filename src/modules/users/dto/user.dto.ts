import { BaseResponseDto } from '@/models/base-response.dto';
import { IUserDto, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'The email of the user', type: String })
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
