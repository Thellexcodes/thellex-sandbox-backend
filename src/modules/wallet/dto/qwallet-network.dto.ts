import { ApiProperty } from '@nestjs/swagger';

export class QWalletNetworkDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  deposits_enabled: boolean;

  @ApiProperty()
  withdraws_enabled: boolean;
}
