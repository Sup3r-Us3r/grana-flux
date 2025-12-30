import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserGatewayDTO } from './user-gateway-dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/users',
})
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UserGateway.name);
  private connectedClients = new Map<string, Socket>();

  afterInit() {
    this.logger.log('WebSocket Users Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);

    client.emit('connection.success', {
      message: 'Connected to users updates',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
  }

  @SubscribeMessage('users')
  handleMessage(
    @MessageBody() data: UserGatewayDTO,
    @ConnectedSocket() client: Socket,
  ): string {
    try {
      const dto = new UserGatewayDTO(data);
      this.logger.log(
        `Received message from client ${client.id}:`,
        dto.toApplicationInput(),
      );
      return 'Message received';
    } catch (error) {
      this.logger.error('Invalid message format', error.message);
      return 'Invalid message';
    }
  }

  emitUserCreated(payload: any) {
    this.server.emit('user.created', payload);
  }

  emitUserUpdated(payload: any) {
    this.server.emit('user.updated', payload);
  }
}
