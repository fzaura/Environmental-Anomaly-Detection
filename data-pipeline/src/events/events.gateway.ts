import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  // Cache to store the latest anomalous reports for persistence across client reloads
  private readonly recentAnomalies: any[] = [];
  private readonly serverStartTime = Date.now();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('serverStartTime', this.serverStartTime);

    // Send cached anomalies to the newly connected client
    client.emit('historicalAnomalies', this.recentAnomalies);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  broadcastAnomaly(report: any) {
    // Add to history and cap at 50 to prevent memory leaks
    this.recentAnomalies.unshift(report);
    if (this.recentAnomalies.length > 50) {
      this.recentAnomalies.pop();
    }

    this.server.emit('anomalyDetected', report);
  }

  @SubscribeMessage('getUptime')
  handleGetUptime(client: Socket) {
    client.emit('uptime', process.uptime());
  }
}
