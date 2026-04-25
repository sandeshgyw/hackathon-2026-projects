import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinRoomDto, SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/communication',
  cors: { origin: '*' },
})
export class CommunicationGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit() {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    client.join(payload.conversationId);
    return {
      event: 'joinedRoom',
      data: {
        conversationId: payload.conversationId,
      },
    };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: SendMessageDto) {
    const { message, aiMessage } = await this.chatService.sendMessage(payload);

    this.server.to(payload.conversationId).emit('messageCreated', message);

    if (aiMessage) {
      this.server.to(payload.conversationId).emit('messageCreated', aiMessage);
    }

    return {
      event: 'messageAck',
      data: {
        messageId: message.id,
        aiMessageId: aiMessage?.id ?? null,
      },
    };
  }
}
