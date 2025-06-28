import { BaseResponseDto } from '@/models/base-response.dto';
import { AuthVerificationCodesEntity } from '@/utils/typeorm/entities/auth-verification-codes.entity';
import { AuthEntity } from '@/utils/typeorm/entities/auth.entity';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { DeviceEntity } from '@/utils/typeorm/entities/device.entity';
import { PayoutSettingEntity } from '@/utils/typeorm/entities/settings/payout-settings.entity';
import { TaxSettingEntity } from '@/utils/typeorm/entities/settings/tax.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TierInfoDto } from './tier-info.dto';

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
