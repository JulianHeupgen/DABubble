import { User } from './user.class';

export class DirectMessage {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  timestamp: Date;

  constructor(id: number, sender: User, recipient: User, content: string) {
    this.id = id;
    this.sender = sender;
    this.recipient = recipient;
    this.content = content;
    this.timestamp = new Date();
  }
}

