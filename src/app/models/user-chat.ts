import { Message } from './message.class';
import { User } from './user.class';

export class UserChat {
  userChatId: string;
  participants: User[];
  messages: Message[];

  constructor(participants: User[]) {
    this.userChatId = '';
    this.participants = participants;
    this.messages = [];
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

