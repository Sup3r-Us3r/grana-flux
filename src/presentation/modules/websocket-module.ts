import { UserGateway } from '@infra/websocket/gateways/users/user-gateway';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [UserGateway],
  exports: [UserGateway],
})
export class WebSocketModule {}
