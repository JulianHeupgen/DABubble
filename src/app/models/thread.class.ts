// thread.model.ts
import { Message } from './message.class';

export class Thread {
  threadId: string;
  channelId: string;
  messages: Message[];
  timestamp: Date;

  constructor(data: {
    threadId?: string,
    channelId: string,
    messages?: Message[],
    timestamp: Date
  }) {
    this.threadId = data.threadId || '';
    this.channelId = data.channelId;
    this.messages = data.messages || [];
    this.timestamp = data.timestamp;
  }

}

