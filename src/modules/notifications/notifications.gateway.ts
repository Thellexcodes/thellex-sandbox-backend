import { NotificationPayload } from '@/types/notification.types';
import { NOTIFICATION_SOCKETS } from '@/types/socket.enums';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log(`Socket connected: ${client.id} with userId: ${userId}`);

    if (!userId) {
      client.disconnect(true);
      return;
    }
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)?.add(client.id);

    console.log('Current userSockets map:');
    for (const [user, sockets] of this.userSockets.entries()) {
      console.log(
        `User: ${user}, Socket IDs: [${Array.from(sockets).join(', ')}]`,
      );
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.userSockets.get(userId)?.delete(client.id);
    if (this.userSockets.get(userId)?.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  emitNotificationToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) =>
        this.server.to(socketId).emit('notification', notification),
      );
    }
  }

  /**
   *
   * @param alertID user alert id
   * @param payload
   */
  async emitDepositSuccessfulToUser(
    alertID: string,
    payload: NotificationPayload,
  ) {
    if (this.userSockets.has(alertID)) {
      const sockets = this.userSockets.get(alertID);
      sockets.forEach((socketId) => {
        this.server
          .to(socketId)
          .emit(NOTIFICATION_SOCKETS.DEPOSIT_SUCCESSFUL, payload);
      });
    }
  }
}
