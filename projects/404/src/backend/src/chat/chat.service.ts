import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { MessageSender, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

const conversationSelect = {
  id: true,
  userIds: true,
  createdAt: true,
} satisfies Prisma.ConversationSelect;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  senderType: true,
  content: true,
  metadata: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

type ConversationPayload = Prisma.ConversationGetPayload<{
  select: typeof conversationSelect;
}>;

type MessagePayload = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

@Injectable()
export class ChatService {
  private readonly geminiModel = 'gemini-3-flash-preview';
  private readonly geminiApiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENAI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  private readonly geminiClient = this.geminiApiKey
    ? new GoogleGenAI({ apiKey: this.geminiApiKey })
    : null;

  constructor(private readonly prisma: PrismaService) {}

  async createConversation(dto: CreateConversationDto) {
    const uniqueUserIds = [
      ...new Set(dto.userIds.map((id) => id.trim())),
    ].filter((id) => id.length > 0);

    if (uniqueUserIds.length < 1 || uniqueUserIds.length > 2) {
      throw new BadRequestException('Conversation must include 1 or 2 users');
    }

    return this.prisma.conversation.create({
      data: { userIds: uniqueUserIds },
      select: conversationSelect,
    });
  }

  async findConversationById(id: string): Promise<ConversationPayload> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      select: conversationSelect,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async listMessages(conversationId: string): Promise<MessagePayload[]> {
    await this.findConversationById(conversationId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: messageSelect,
    });
  }

  async sendMessage(dto: SendMessageDto): Promise<{
    message: MessagePayload;
    aiMessage: MessagePayload | null;
  }> {
    const conversation = await this.findConversationById(dto.conversationId);

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: dto.senderId,
        senderType: dto.senderType ?? MessageSender.USER,
        content: dto.content,
        metadata: this.toJsonValue(dto.metadata),
      },
      select: messageSelect,
    });

    const shouldGenerateAiReply =
      conversation.userIds.length === 1 &&
      message.senderType !== MessageSender.SYSTEM;

    if (!shouldGenerateAiReply) {
      return { message, aiMessage: null };
    }

    const aiContent = await this.generateAiReply(conversation, message);

    const aiMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: 'SYSTEM',
        senderType: MessageSender.SYSTEM,
        content: aiContent,
        metadata: this.toJsonValue({ model: this.geminiModel }),
      },
      select: messageSelect,
    });

    return { message, aiMessage };
  }

  private async generateAiReply(
    conversation: ConversationPayload,
    message: MessagePayload,
  ): Promise<string> {
    const userId = conversation.userIds[0] ?? message.senderId;

    if (!this.geminiClient) {
      return 'I can only answer healthcare questions in your care context. I am currently unavailable because the AI key is not configured.';
    }

    const [profile, history] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, role: true },
      }),
      this.prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: {
          senderType: true,
          content: true,
          createdAt: true,
        },
      }),
    ]);

    const prompt = [
      'You are a healthcare assistant for a telemedicine platform.',
      'Only answer healthcare-related questions tied to the user context and conversation data provided below.',
      'If the user asks for non-healthcare topics, legal/financial advice, or anything unrelated, politely decline in one short sentence.',
      'Do not claim access to any data not listed below.',
      '',
      `User profile: ${JSON.stringify(profile ?? { id: userId })}`,
      `Conversation history: ${JSON.stringify(history)}`,
      `Latest user message: ${message.content}`,
      '',
      'Answer in concise, safe healthcare guidance and include a suggestion to consult a clinician when necessary.',
    ].join('\n');

    try {
      const response = await this.geminiClient.models.generateContent({
        model: this.geminiModel,
        contents: prompt,
      });

      const directText =
        typeof (response as { text?: unknown }).text === 'string'
          ? (response as { text: string }).text.trim()
          : '';

      if (directText.length > 0) {
        return directText;
      }

      const candidateText =
        response.candidates
          ?.flatMap((candidate) => candidate.content?.parts ?? [])
          .map((part) => part.text ?? '')
          .join(' ')
          .trim() ?? '';

      if (candidateText.length > 0) {
        return candidateText;
      }
    } catch {
      return 'I can only help with healthcare-related questions in your care context. Please ask a medical question related to your care.';
    }

    return 'I can only help with healthcare-related questions in your care context. Please ask a medical question related to your care.';
  }

  private toJsonValue(
    value: Record<string, unknown> | undefined,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }
    return value as Prisma.InputJsonValue;
  }
}
