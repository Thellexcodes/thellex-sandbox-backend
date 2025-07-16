import { BaseResponseDto } from '@/models/base-response.dto';
import { ITransactionHistoryDto } from '@/utils/typeorm/entities/transaction-history.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BankInfoDto } from './fiat-to-crypto-request.dto';
import { RampReciepientInfoDto } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';

export class CreateWithdrawalResponseDto extends BaseResponseDto<ITransactionHistoryDto> {
  @ApiProperty({ type: ITransactionHistoryDto })
  result: ITransactionHistoryDto;
}
