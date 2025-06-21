import { TierEnum } from '@/constants/tier.lists';
import { BaseResponseDto } from '@/models/base-response.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

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

class TokenDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  assetCode: string;

  @ApiProperty({ nullable: true })
  issuer: string | null;

  @ApiProperty()
  decimals: number;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  walletType: string;

  @ApiProperty()
  walletProvider: string;
}

class WalletDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ nullable: true })
  reference: string | null;

  @ApiProperty()
  address: string;

  @ApiProperty({ nullable: true })
  isCrypto: boolean | null;

  @ApiProperty({ nullable: true })
  destinationTag: string | null;

  @ApiProperty({ nullable: true })
  totalPayments: number | null;

  @ApiProperty()
  walletProvider: string;

  @ApiProperty()
  walletType?: string;

  @ApiProperty({ nullable: true })
  defaultNetwork?: string | null;

  @ApiProperty({ type: [String], nullable: true })
  networks?: string[];

  @ApiProperty({ type: [TokenDto], nullable: true })
  tokens?: TokenDto[];
}

class QWalletProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  qid: string;

  @ApiProperty()
  qsn: string;

  @ApiProperty()
  state: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ nullable: true })
  reference: string | null;

  @ApiProperty({ nullable: true })
  displayName: string | null;

  @ApiProperty()
  walletProvider: string;

  @ApiProperty({ type: [WalletDto] })
  wallets: WalletDto[];
}

class CWalletProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  walletSetId: string;

  @ApiProperty({ nullable: true })
  displayName: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: [WalletDto] })
  wallets: WalletDto[];
}

class UserResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  uid: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ nullable: true })
  suspended: string | null;

  @ApiProperty()
  idempotencyKey: string;

  @ApiProperty()
  alertID: string;

  @ApiProperty({ enum: TierEnum, example: TierEnum.BASIC })
  tier: TierEnum;

  @ApiProperty({ type: [String] })
  electronic_cards: string[];

  @ApiProperty({ type: [String] })
  transactionHistory: string[];

  @ApiProperty({ type: [String] })
  notifications: string[];

  @ApiProperty({ type: QWalletProfileDto })
  qWalletProfile: QWalletProfileDto;

  @ApiProperty({ type: CWalletProfileDto })
  cWalletProfile: CWalletProfileDto;

  @ApiProperty({ type: [String] })
  settings: string[];

  @ApiProperty({ type: [String] })
  bankAccounts: string[];

  @ApiProperty({ nullable: true })
  payoutSettings: string | null;

  @ApiProperty({ nullable: true })
  taxSettings: string | null;

  @ApiProperty({ nullable: true })
  password: string | null;
}

export class UserVerifyResponseDto extends BaseResponseDto<UserResultDto> {
  @ApiProperty({ type: UserResultDto })
  result: UserResultDto;
}

export class UserAuthenticateResponseDto extends BaseResponseDto<UserResultDto> {
  @ApiProperty({ type: UserResultDto })
  result: UserResultDto;
}
