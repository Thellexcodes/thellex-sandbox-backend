import { getAppConfig } from '@/v1/constants/env';
import { isProd } from '@/v1/utils/helpers';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  private readonly allowedDomains: RegExp[];
  private readonly devAllowedDomains: RegExp[];
  private readonly parser: UAParser;

  constructor() {
    const config = getAppConfig();
    this.parser = new UAParser();

    this.allowedDomains = [
      /^https?:\/\/([a-zA-Z0-9-]+\.)*thellex\.com$/, // thellex.com and subdomains
      /^https?:\/\/([a-zA-Z0-9-]+\.)*circle\.com$/, // circle.com and subdomains
      /^https?:\/\/([a-zA-Z0-9-]+\.)*quidax\.com$/, // quidax.com and subdomains
      /^https?:\/\/([a-zA-Z0-9-]+\.)*yellowcard\.io$/, // yellowcard.io and subdomains
    ];

    this.devAllowedDomains = [
      /^http?:\/\/localhost(:[0-9]+)?$/, // localhost with optional port
      /^http?:\/\/127\.0\.0\.1(:[0-9]+)?$/, // 127.0.0.1 with optional port
      /^https?:\/\/([a-zA-Z0-9-]+\.)*yellowcard\.io$/, // yellowcard.io and subdomains
      /^https?:\/\/([a-zA-Z0-9-]+\.)*circle\.com$/, // circle.com and subdomains
      /^https?:\/\/([a-zA-Z0-9-]+\.)*quidax\.com$/, // quidax.com and subdomains
    ];
  }

  canActivate(context: ExecutionContext): boolean {
    // const request = context.switchToHttp().getRequest();
    // const signature = request.headers['x-signature'];
    // const timestamp = request.headers['x-timestamp'];
    // const fingerprint = request.headers['x-certificate-fingerprint'];
    // const userAgent = request.headers['user-agent'];
    // const clientTypeHeader = request.headers['x-client-type']; // Optional override
    // const payload = JSON.stringify(request.body || {});

    // // Auto-detect client type from User-Agent
    // let clientType: 'mobile' | 'web';
    // if (clientTypeHeader && ['mobile', 'web'].includes(clientTypeHeader)) {
    //   clientType = clientTypeHeader; // Allow header override for backward compatibility
    // } else if (!userAgent) {
    //   throw new UnauthorizedException('Missing User-Agent header');
    // } else {
    //   this.parser.setUA(userAgent);
    //   const { device, os } = this.parser.getResult();
    //   const isMobile =
    //     device.type === 'mobile' && ['Android', 'iOS'].includes(os.name);
    //   clientType = isMobile ? 'mobile' : 'web';
    // }

    // if (clientType === 'mobile') {
    //   // Mobile validation
    //   if (!signature || !timestamp || !fingerprint) {
    //     throw new UnauthorizedException('Missing required headers');
    //   }

    //   // const isValid = this.verifySignature(
    //   //   fingerprint,
    //   //   timestamp,
    //   //   payload,
    //   //   signature,
    //   // );
    //   // if (!isValid) {
    //   //   throw new UnauthorizedException('Invalid signature');
    //   // }

    //   return true;
    // } else if (clientType === 'web') {
    //   // Validate web request origin
    //   const origin = request.headers['origin'] || request.headers['referer'];
    //   if (!origin && isProd) {
    //     throw new UnauthorizedException('Missing Origin or Referer header');
    //   }

    //   // Skip origin validation in non-production if no origin is provided
    //   if (!origin && !isProd) {
    //     return true;
    //   }

    //   // Choose allowed domains based on environment
    //   const allowedDomains = isProd
    //     ? this.allowedDomains
    //     : this.devAllowedDomains;

    //   // Check if the origin matches any allowed domain
    //   const isAllowed = allowedDomains.some((regex) => regex.test(origin));
    //   if (!isAllowed) {
    //     if (!isProd) {
    //       console.log(`Unauthorized request: ${origin}`);
    //     }
    //     throw new UnauthorizedException('Request origin not allowed');
    //   }

    return true;
    // }

    // return false;
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
      if (!isProd) {
        console.log(
          `Invalid fingerprint. Received: ${fingerprint}, Expected: ${validFingerprint}`,
        );
      }
      throw new UnauthorizedException('Invalid certificate fingerprint');
    }

    const requestTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 600) {
      throw new UnauthorizedException('Invalid or expired timestamp');
    }

    const dataToSign = `${timestamp}:${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', validFingerprint)
      .update(dataToSign)
      .digest('hex')
      .toLowerCase();

    if (signature !== expectedSignature) {
      if (!isProd) {
        console.log(
          `Signature mismatch. Received: ${signature}, Expected: ${expectedSignature}`,
        );
      }
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
