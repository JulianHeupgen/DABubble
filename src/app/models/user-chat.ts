import { Message } from './message.class';
import { User } from './user.class';

export class UserChat {
  userChatId: string;
<<<<<<< Updated upstream
  participants: string[];
  messages: Message[];

  constructor(data: {
    userChatId?: string,
    participants?: string[],
    messages?: Message[]
  }) {
    this.userChatId = data.userChatId || '';
    this.participants = data.participants || [];
    this.messages = data.messages || [];
=======
  chatId: string;
  participants: User[];
  messages: Message[];

  constructor(participants: User[]) {
    this.userChatId = '';
    this.chatId = '';
    this.participants = participants;
    this.messages = [];
>>>>>>> Stashed changes
  }


  addMessage(message: Message): void {
    this.messages.push(message);
  }


  toJSON() {
    return {
      userChatId: this.userChatId,
      chatId: this.chatId,
      participants: this.participants,
      messages: this.messages
    }
  }

}

