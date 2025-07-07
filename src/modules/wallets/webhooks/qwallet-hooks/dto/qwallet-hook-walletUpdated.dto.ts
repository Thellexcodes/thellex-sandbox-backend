import {
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IQwalletSubAccount,
  QwalletSubAccountDto,
} from '@/modules/wallets/qwallet/dto/qwallet-subaccount.dto';
import { ApiProperty } from '@nestjs/swagger';

class WalletAddressDataDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  reference?: string;

  @IsString()
  @ApiProperty()
  currency: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  network: string;

  @ValidateNested()
  @ApiProperty()
  @Type(() => QwalletSubAccountDto)
  user: QwalletSubAccountDto;

  @IsOptional()
  @IsString()
  @ApiProperty()
  destination_tag?: string;

  @IsOptional()
  @ApiProperty()
  total_payments?: any;

  @IsDateString()
  @ApiProperty()
  created_at: string;

  @IsDateString()
  @ApiProperty()
  updated_at: string;
}

export class QWalletAddressGeneratedDto {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WalletAddressDataDto)
  data: WalletAddressDataDto;
}

export interface IQWalletAddressGenerated {
  id: string;
  reference?: string | null;
  currency: string;
  address: string;
  network: string;
  user: IQwalletSubAccount;
  destination_tag?: string | null;
  total_payments?: any;
  created_at: string;
  updated_at: string;
}
