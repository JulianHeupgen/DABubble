import { Message } from './message.class';
import { User } from './user.class';

export class UserChat {
  userChatId: string;
  participants: User[];
  messages: Message[];

  constructor(data: {
    userChatId?: string,
    participants?: User[],
    messages?: Message[]
  }) {
    this.userChatId = data.userChatId || '';
    this.participants = data.participants || [];
    this.messages = data.messages || [];
  }


  addMessage(message: Message): void {
    this.messages.push(message);
  }


  toJSON() {
    return {
      userChatId: this.userChatId,
      participants: this.participants,
      messages: this.messages
    }
  }

}

