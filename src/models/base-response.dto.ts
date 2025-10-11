import { ApiProperty } from '@nestjs/swagger';

// export interface ResponseHandlerResult<T = any> {
//   result: T;
//   status: boolean;
//   sessionId?: string;
//   path: string;
//   statusCode: number;
// }

export class BaseResponseDto<T> {
  result: T;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty()
  sessionId?: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ example: 201 })
  statusCode: number;
}

export class RequestResponseTypeDto<T> {
  status: string;
  message: string;
  data: T;
}
