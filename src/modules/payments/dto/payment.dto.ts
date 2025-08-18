import { BaseResponseDto } from '@/models/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ITransactionHistoryDto } from '@/utils/typeorm/entities/transactions/transaction-history.entity';

export class CreateWithdrawalResponseDto extends BaseResponseDto<ITransactionHistoryDto> {
  @ApiProperty({ type: ITransactionHistoryDto })
  result: ITransactionHistoryDto;
}
