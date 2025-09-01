import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/v1/models/base-response.dto';
import { IUserDto } from '@/v1/utils/typeorm/entities/user.entity';

export class VerifyUserDto {
  @ApiProperty()
  code: number;
}

export class VerifiedResponseDto extends BaseResponseDto<IUserDto> {
  @ApiProperty({ type: IUserDto })
  result: IUserDto;
}
