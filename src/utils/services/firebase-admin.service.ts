import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from 'firebase/serviceAccountKey.json';

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(FirebaseMessagingService.name);

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });

      this.logger.log('Firebase Admin initialized.');
    }
  }

  async sendMessage(
    token: string,
    data?: Record<string, string>,
    notification?: { title: string; body: string },
  ): Promise<string> {
    const message: admin.messaging.Message = {
      token,
      data,
      notification,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`✅ FCM message sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Failed to send FCM message`, error.stack || error);
      throw error;
    }
  }
}
