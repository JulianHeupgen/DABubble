import { Message } from './message.class';
import { User } from './user.class';

export class UserChat {
  id: number;
  participants: User[];
  messages: Message[];

  constructor(id: number, participants: User[]) {
    this.id = id;
    this.participants = participants;
    this.messages = [];
  }

  addMessage(message: Message): void {
    this.messages.push(message);
  }

}

