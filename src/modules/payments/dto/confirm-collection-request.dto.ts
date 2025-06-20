import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmCollectionRequestDto {
  @ApiProperty({ description: 'Currency code', example: '9b4fba6b-1...' })
  @IsString()
  readonly id: string;
}
