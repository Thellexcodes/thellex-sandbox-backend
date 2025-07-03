import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  result: T;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty()
  path: string;

  @ApiProperty({ example: 201 })
  statusCode: number;
}
