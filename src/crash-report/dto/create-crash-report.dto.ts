import { ApiProperty } from '@nestjs/swagger';

export class CreateCrashReportDto {
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  device: string;
  @ApiProperty()
  os: string;
  @ApiProperty()
  log: string;
}
