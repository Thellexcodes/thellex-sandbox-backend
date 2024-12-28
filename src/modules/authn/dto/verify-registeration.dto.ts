import { ApiProperty } from '@nestjs/swagger';
import { RegistrationResponseJSON } from '@simplewebauthn/server';

export class VerifyRegistationDto {
  @ApiProperty({ description: 'Attestation response', type: String })
  attestationResponse: RegistrationResponseJSON;
  challenge: string;
}
