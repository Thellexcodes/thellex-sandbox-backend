import { ApiProperty } from '@nestjs/swagger';

export class CreateFiatWalletDto {
  @ApiProperty({ description: 'The BVN of the user', type: String })
  bvn: string;

  @ApiProperty({ description: 'The Date of Birth of user', type: String })
  dob: string;
}
