import { BaseResponseDto } from '@/models/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class INotificationConsumeResponseDto {
  @Expose()
  @IsString()
  @ApiProperty({ example: 'Id of notification' })
  id: string;

  @Expose()
  @IsBoolean()
  @ApiProperty({ example: 'True' })
  consumed: boolean;
}

export class NoficationConsumeResponse extends BaseResponseDto<INotificationConsumeResponseDto> {
  @ApiProperty({ type: INotificationConsumeResponseDto })
  result: INotificationConsumeResponseDto;
}
