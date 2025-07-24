import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class VerifyBvnDto {
  @ApiProperty({
    description: '11-digit Bank Verification Number (BVN)',
    example: 12345678901,
  })
  @IsInt({ message: 'BVN must be an integer' })
  @Min(10000000000, { message: 'BVN must be at least 11 digits' })
  @Max(99999999999, { message: 'BVN must be at most 11 digits' })
  bvnNumber: number;
}
