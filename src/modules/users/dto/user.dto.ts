import { TierEnum } from '@/constants/tier.lists';
import { BaseResponseDto } from '@/models/base-response.dto';
import { IUserDto, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IWalletDto } from '@/utils/typeorm/entities/wallets/wallets.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'The email of the user', type: String })
  email: string;
}

export class AccessTokenResultDto {
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

export class UserResponseDto extends BaseResponseDto<UserEntity> {
  @ApiProperty({ type: () => UserEntity })
  result: UserEntity;
}

@Exclude()
export class CWalletProfileDto {
  @Expose()
  @ApiProperty()
  state: string;

  @Expose()
  @ApiProperty()
  walletSetId: string;

  @Expose()
  @ApiProperty({ nullable: true })
  displayName: string | null;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;

  @Expose()
  @Type(() => IWalletDto)
  @ApiProperty({ type: [IWalletDto] })
  wallets: IWalletDto[];
}

export class UserAuthenticateResponseDto extends BaseResponseDto<IUserDto> {
  @ApiProperty({ type: IUserDto })
  result: IUserDto;
}
