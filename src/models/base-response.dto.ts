import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  result: T;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: '/user/access' })
  path: string;

  @ApiProperty({ example: 201 })
  statusCode: number;
}
