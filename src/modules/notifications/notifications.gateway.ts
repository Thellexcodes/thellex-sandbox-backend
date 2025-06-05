import { NOTIFICATION_SOCKETS } from '@/types/socket.enums';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Map userId to socket ids (optional, for targeted emit)
  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect(true);
      return;
    }
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)?.add(client.id);
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
  async emitDepositSuccessfulToUser(alertID: string, payload: any) {
    const sockets = this.userSockets.get(alertID);
    if (sockets) {
      sockets.forEach((socketId) =>
        this.server
          .to(socketId)
          .emit(NOTIFICATION_SOCKETS.DEPOSIT_SUCCESSFUL, payload),
      );
    }
  }
}
