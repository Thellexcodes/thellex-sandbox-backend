import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ITokenDto } from '../token/token.entity';
import { BaseDto } from '../base.entity';

@Exclude()
export class IWalletDto extends BaseDto {
  @Expose()
  @ApiProperty({ nullable: true })
  reference: string | null;

  @Expose()
  @ApiProperty()
  address: string;

  @Expose()
  @ApiProperty({ nullable: true })
  isCrypto: boolean | null;

  @Expose()
  @ApiProperty({ nullable: true })
  destinationTag: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  totalPayments: number | null;

  @Expose()
  @ApiProperty()
  walletProvider: string;

  @Expose()
  @ApiProperty({ nullable: true })
  walletType?: string;

  @Expose()
  @ApiProperty({ nullable: true })
  defaultNetwork?: string | null;

  @Expose()
  @ApiProperty({ type: [String], nullable: true })
  networks?: string[];

  @Expose()
  @Type(() => ITokenDto)
  @ApiProperty({ type: [ITokenDto], nullable: true })
  tokens?: ITokenDto[];
}
