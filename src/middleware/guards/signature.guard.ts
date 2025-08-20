import { getAppConfig } from '@/constants/env';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-signature'];
    const timestamp = request.headers['x-timestamp'];
    const fingerprint = request.headers['x-certificate-fingerprint'];
    const clientType = request.headers['x-client-type'];
    const payload = JSON.stringify(request.body || {});

    // Validate client type
    if (clientType !== 'mobile' && clientType !== 'web') {
      throw new UnauthorizedException('Invalid client type');
    }

    if (clientType === 'mobile') {
      if (!signature || !timestamp || !fingerprint || !clientType) {
        throw new UnauthorizedException('Missing required headers');
      }

      const isValid = this.verifySignature(
        fingerprint,
        timestamp,
        payload,
        signature,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid signature');
      }

      return true;
    }
  }

  verifySignature(
    fingerprint: string,
    timestamp: string,
    payload: string,
    signature: string,
  ): boolean {
    const validFingerprint = getAppConfig()
      .APP_CERTIFICATE_FINGERPRINT.replace(/:/g, '')
      .toLowerCase();

    if (fingerprint !== validFingerprint) {
      console.log(
        `Invalid fingerprint. Received: ${fingerprint}, Expected: ${validFingerprint}`,
      );
      throw new UnauthorizedException('Invalid certificate fingerprint');
    }

    const requestTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 600) {
      // console.log(
      //   `Timestamp invalid. Current: ${currentTime}, Received: ${requestTime}, Diff: ${Math.abs(currentTime - requestTime)}s`,
      // );
      throw new UnauthorizedException('Invalid or expired timestamp');
    }

    const dataToSign = `${timestamp}:${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', validFingerprint)
      .update(dataToSign)
      .digest('hex')
      .toLowerCase();

    // console.log(`signature=${signature}, expected=${expectedSignature}`);

    // if (signature !== expectedSignature) {
    //   console.log('Signature mismatch');
    //   throw new UnauthorizedException('Invalid signature');
    // }

    return true;
  }
}
