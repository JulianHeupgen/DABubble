import { User } from './user.class';

export class Message {
  sender: User;
  content: string;
  timestamp: Date;
  replies: Message[];      // Direkte Antworten von anderen User auf diese Message
  reactions: string[];    // Emojis als Zeichenketten speichern

  constructor(sender: User, content: string) {
    this.sender = sender;
    this.content = content;
    this.timestamp = new Date();
    this.replies = [];
    this.reactions = [];
  }
}

