import { ApiProperty } from '@nestjs/swagger';
import { RegistrationResponseJSON } from '@simplewebauthn/server';

export class VerifyRegistrationDto {
  @ApiProperty({
    description: 'Attestation response with additional signature field',
    type: Object,
  })
  attestationResponse: RegistrationResponseJSON;

  @ApiProperty({
    description: 'Challenge from the server for verification',
    type: String,
  })
  challenge: string;
}
