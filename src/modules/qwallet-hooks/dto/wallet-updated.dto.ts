// src/modules/qwallet-hooks/dto/wallet-updated.dto.ts
import { IsString, IsBoolean, IsObject, IsOptional } from 'class-validator';

class UserDto {
  @IsString() id: string;
  @IsString() sn: string;
  @IsString() email: string;
  @IsOptional() @IsString() reference?: string;
  @IsString() first_name: string;
  @IsString() last_name: string;
  @IsString() display_name: string;
  @IsString() created_at: string;
  @IsString() updated_at: string;
}

export class WalletUpdatedDto {
  @IsString() event: string;
  @IsObject() data: {
    id: string;
    currency: string;
    balance: string;
    locked: string;
    staked: string;
    user: UserDto;
    converted_balance: string;
    reference_currency: string;
    is_crypto: boolean;
    created_at: string;
    updated_at: string;
    deposit_address: string;
    destination_tag?: string | null;
  };
}
