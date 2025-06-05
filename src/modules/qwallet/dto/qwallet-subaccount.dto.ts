import { ApiProperty } from '@nestjs/swagger';

export class QwalletSubAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sn: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  reference: string | null;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty({ nullable: true })
  display_name: string | null;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}
