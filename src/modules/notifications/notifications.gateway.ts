import { NotificationPayload } from '@/types/notification.types';
import {
  NOTIFICATION_SOCKETS,
  TRANSACTION_NOTIFICATION_TYPES_ENUM,
} from '@/types/socket.enums';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

//TODO: handle errors with enum
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log(`Socket connected: ${client.id} with userId: ${userId}`);

    // 🚫 Disallow empty or 'default-id' user IDs
    if (!userId || userId === 'default-id') {
      console.log(`Disconnected socket ${client.id} due to invalid userId`);
      client.disconnect(true);
      return;
    }

    // 🔁 Disconnect existing sockets for this user (prevent duplicates)
    const existingSockets = this.userSockets.get(userId);
    if (existingSockets) {
      existingSockets.forEach((socketId) => {
        const socketToDisconnect = this.server.sockets.sockets.get(socketId);
        if (socketToDisconnect && socketToDisconnect.id !== client.id) {
          socketToDisconnect.disconnect(true);
        }
      });
      this.userSockets.set(userId, new Set());
    }

    // ✅ Add the new socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(client.id);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.userSockets.get(userId)?.delete(client.id);
    if (this.userSockets.get(userId)?.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  emitNotificationToUser(alertID: string, notification: any) {
    const sockets = this.userSockets.get(alertID);
    if (sockets) {
      sockets.forEach((socketId) =>
        this.server.to(socketId).emit('notification', notification),
      );
    }
  }

  async emitTransactionNotificationToUser(
    alertID: string,
    eventType: TRANSACTION_NOTIFICATION_TYPES_ENUM,
    payload: NotificationPayload,
  ) {
    const sockets = this.userSockets.get(alertID);
    const event =
      eventType === 'deposit'
        ? NOTIFICATION_SOCKETS.DEPOSIT_SUCCESSFUL
        : NOTIFICATION_SOCKETS.WITHDRAWAL_SUCCESSFUL;

    sockets?.forEach((socketId) => {
      this.server.to(socketId).emit(event, payload);
    });
  }
}
