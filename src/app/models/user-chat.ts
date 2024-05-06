import { DirectMessage } from './direct-message';
import { Message } from './message.class';
import { User } from './user.class';

export class UserChat {
  id: number;
  participants: User[];
  messages: DirectMessage[];

  constructor(id: number, participants: User[]) {
    this.id = id;
    this.participants = participants;
    this.messages = [];
  }

  addMessage(message: DirectMessage): void {
    this.messages.push(message);
  }

}

