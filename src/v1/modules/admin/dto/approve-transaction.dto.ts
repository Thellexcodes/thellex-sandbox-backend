import { ApiProperty } from '@nestjs/swagger';

export class ApproveRampRequestDTO {
  @ApiProperty() approved: boolean;
  @ApiProperty() txId: string;
  @ApiProperty() sequenceId: string;
}

export class ApproveRampRequestResponseDTO extends ApproveRampRequestDTO {}
