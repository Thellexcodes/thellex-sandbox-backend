import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';

export class VerifyAuthenticationDto {
  @ApiProperty({ description: 'Authentication Response', type: Object })
  attestationResponse: AuthenticationResponseJSON;

  @ApiProperty({
    description: 'Challenge from the server for verification',
    type: String,
  })
  challenge: string;
}
