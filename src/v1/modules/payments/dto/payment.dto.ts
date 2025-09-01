import { BaseResponseDto } from '@/v1/models/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ITransactionHistoryDto } from '@/v1/utils/typeorm/entities/transactions/transaction-history.entity';

export class CreateWithdrawalResponseDto extends BaseResponseDto<ITransactionHistoryDto> {
  @ApiProperty({ type: ITransactionHistoryDto })
  result: ITransactionHistoryDto;
}
