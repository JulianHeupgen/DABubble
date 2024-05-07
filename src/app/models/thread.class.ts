// thread.model.ts
import { Message } from './message.class';
import { User } from './user.class';

export class Thread {
  id: string;
  channelId: string;
  messages: Message[];
  timestamp: Date;

  constructor(channelId: string) {
    this.id = '';
    this.channelId = channelId;
    this.messages = [];
    this.timestamp = new Date();
  }

}

