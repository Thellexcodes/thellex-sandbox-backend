import { TierEnum, TransactionLimits } from '@/config/tier.lists';
import { UserRequirement } from '@/models/user.requirements.enum';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TxnFeeDto {
  @ApiProperty({ description: 'Transaction type, e.g. fiat-fiat, crypto-fiat' })
  type: string;

  @ApiProperty({ description: 'Minimum transaction amount for this fee' })
  min: number;

  @ApiProperty({
    description: 'Maximum transaction amount for this fee',
    required: false,
  })
  max?: number;

  @ApiProperty({ description: 'Fee percentage applied to the transaction' })
  feePercentage: number;
}

export class TransactionLimitsDto {
  @ApiProperty({ description: 'Maximum allowed credit per day' })
  dailyCreditLimit: number;

  @ApiProperty({ description: 'Maximum allowed debit per day' })
  dailyDebitLimit: number;

  @ApiProperty({
    description: 'Maximum allowed amount for a single debit transaction',
  })
  singleDebitLimit: number;
}

export class TierInfoDto {
  @ApiProperty({ enum: TierEnum, description: 'Tier name or level' })
  @Expose()
  name: TierEnum;

  @ApiProperty({ description: 'Tier target or goal description' })
  @Expose()
  target: string;

  @ApiProperty({ description: 'Description of the tier' })
  description: string;

  @ApiProperty({
    description: 'Limits for transactions allowed in this tier',
    type: () => TransactionLimitsDto,
  })
  transactionLimits: TransactionLimits;

  @ApiProperty({
    description: 'Transaction fees applicable for this tier',
    isArray: true,
    type: () => TxnFeeDto,
  })
  txnFees: TxnFeeDto[];

  @ApiProperty({
    description: 'User requirements to reach this tier',
    isArray: true,
    enum: UserRequirement,
  })
  requirements: UserRequirement[];
}
