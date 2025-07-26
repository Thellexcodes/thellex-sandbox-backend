import { BaseResponseDto } from '@/models/base-response.dto';
import { NotificationKindEnum } from '@/utils/typeorm/entities/notification.entity';
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

  @Expose()
  @ApiProperty({ enum: Object.values(NotificationKindEnum) })
  kind: NotificationKindEnum;
}

export class NoficationConsumeResponse extends BaseResponseDto<INotificationConsumeResponseDto> {
  @ApiProperty({ type: INotificationConsumeResponseDto })
  result: INotificationConsumeResponseDto;
}
