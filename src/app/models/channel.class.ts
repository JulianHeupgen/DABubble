import { Message } from './message.class';
import { User } from './user.class';

export class Channel {
  title: string;
  participants: User[];
  messages: Message[];

  constructor(title: string) {
    this.title = title;
    this.participants = [];
    this.messages = [];
  }

  addParticipant(user: User): void {
    if (!this.participants.includes(user)) {
      this.participants.push(user);
    }
  }

  removeParticipant(user: User): void {
    const index = this.participants.indexOf(user);
    if (index !== -1) {
      this.participants.splice(index, 1);
    }
  }

  addMessage(sender: User, content: string): void {
    const message = new Message(sender, content);
    this.messages.push(message);
  }

}

