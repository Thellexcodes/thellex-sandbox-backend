import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/models/base-response.dto';
import { IUserDto } from '@/utils/typeorm/entities/user.entity';
import { Exclude } from 'class-transformer';

export class VerifyUserDto {
  @ApiProperty()
  code: number;
}

export class VerifiedResponseDto extends BaseResponseDto<IUserDto> {
  @ApiProperty({ type: IUserDto })
  result: IUserDto;
}
