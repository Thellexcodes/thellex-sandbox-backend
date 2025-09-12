// src/firebase/firebase-auth.service.ts
import { getAppConfig } from '@/constants/env';
import { Injectable } from '@nestjs/common';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class FirebaseAuthService {
  private readonly authClient: GoogleAuth;

  constructor() {
    const keyJson = getAppConfig().FIREBASE.SERVICE_ACCOUNT;
    if (!keyJson) throw new Error('No service account provided in env');

    const serviceAccount = JSON.parse(keyJson);

    this.authClient = new GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/firebase',
        'https://www.googleapis.com/auth/cloud-platform',
      ],
    });
  }

  async getAccessToken(): Promise<string> {
    const client = await this.authClient.getClient();
    const { token } = await client.getAccessToken();
    if (!token) throw new Error('Failed to obtain Google access token');
    return token;
  }

  /** Return all Firebase auth info needed by DistributionService */
  async getFirebaseAuthData(): Promise<{
    token: string;
    projectNumber: string;
    appId: string;
  }> {
    const token = await this.getAccessToken();
    return {
      token,
      projectNumber: getAppConfig().FIREBASE.PROJECT_NUMBER,
      appId: getAppConfig().FIREBASE.APP_ID,
    };
  }
}
