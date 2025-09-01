import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TransactionPolicyDto {
  @Expose()
  @ApiProperty({ example: true })
  cryptoDepositAllowed: boolean;

  @Expose()
  @ApiProperty({ example: false })
  cryptoDepositRequiresKyc: boolean;

  @Expose()
  @ApiProperty({ example: true })
  cryptoWithdrawalAllowed: boolean;

  @Expose()
  @ApiProperty({ example: true })
  cryptoWithdrawalRequiresKyc: boolean;

  @Expose()
  @ApiProperty({ example: true })
  fiatToCryptoDepositAllowed: boolean;

  @Expose()
  @ApiProperty({ example: true })
  fiatToCryptoDepositRequiresKyc: boolean;

  @Expose()
  @ApiProperty({ example: true })
  cryptoToFiatWithdrawalAllowed: boolean;

  @Expose()
  @ApiProperty({ example: true })
  cryptoToFiatWithdrawalRequiresKyc: boolean;

  @Expose()
  @ApiProperty({ example: true })
  fiatToFiatDepositAllowed: boolean;

  @Expose()
  @ApiProperty({ example: true })
  fiatToFiatDepositRequiresKyc: boolean;

  @Expose()
  @ApiProperty({ example: true })
  fiatToFiatWithdrawalAllowed: boolean;

  @Expose()
  @ApiProperty({ example: true })
  fiatToFiatWithdrawalRequiresKyc: boolean;
}
