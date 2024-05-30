import { Message } from './message.class';

export class UserChat {
  userChatId: string;
  chatId: string;
  participants: string[];
  messages: Message[];

  constructor(data:  {
    userChatId?: string,
    chatId?: string,
    participants?: string [],
    messages?: Message[]
  }) {
    this.userChatId = data.userChatId || '';
    this.chatId = data.chatId || '';
    this.participants = data.participants || [];
    this.messages = data.messages || [];
  }


  addMessage(message: Message): void {
    this.messages.push(message);
  }


  toJSON(): {} {
    return {
      userChatId: this.userChatId,
      chatId: this.chatId,
      participants: this.participants,
      messages: this.messages.map(message => message.toJSON())
    }
  }

}

