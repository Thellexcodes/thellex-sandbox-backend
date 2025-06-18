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
} from '../../qwallet/dto/qwallet-subaccount.dto';

class WalletAddressDataDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsString()
  currency: string;

  @IsString()
  address: string;

  @IsString()
  network: string;

  @ValidateNested()
  @Type(() => QwalletSubAccountDto)
  user: QwalletSubAccountDto;

  @IsOptional()
  @IsString()
  destination_tag?: string;

  @IsOptional()
  total_payments?: any;

  @IsDateString()
  created_at: string;

  @IsDateString()
  updated_at: string;
}

export class QWalletAddressGeneratedDto {
  @IsString()
  event: string;

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
