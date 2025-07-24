import { TierEnum, TxnTypeEnum } from '@/config/tier.lists';
import { UserRequirement } from '@/models/user.requirements.enum';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Limits for transactions allowed in this tier',
    type: () => TransactionLimitsDto,
  })
  @Expose()
  @Type(() => TransactionLimitsDto)
  transactionLimits: TransactionLimitsDto;

  @ApiProperty({
    description: 'Transaction fee applicable for this tier (only withdrawal)',
    type: () => TxnFeeDto,
    isArray: false,
  })
  @Expose()
  @Type(() => TxnFeeDto)
  txnFee: Partial<Record<TxnTypeEnum, TxnFeeDto>>;

  @ApiProperty({
    description: 'User requirements to reach this tier',
    isArray: true,
    enum: UserRequirement,
  })
  @Expose()
  requirements: UserRequirement[];
}

export class TxnFeeDto {
  @Expose()
  @ApiProperty({ description: 'Minimum transaction amount for this fee' })
  min: number;

  @Expose()
  @ApiProperty({
    description: 'Maximum transaction amount for this fee',
    required: false,
  })
  max?: number;

  @Expose()
  @ApiProperty({ description: 'Fee percentage applied to the transaction' })
  feePercentage: number;
}
