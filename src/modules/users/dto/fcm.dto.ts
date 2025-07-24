import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FcmDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging (FCM) token for push notifications',
    example: 'eK1zpGg4T9SzQrJ5v0i3Gg:APA91bH8N1J8n6rZ_aD8QrL...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
