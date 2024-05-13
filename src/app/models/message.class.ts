import { User } from './user.class';

export class Message {
  sender: User;
  content: string;
  timestamp: Number;
  replies: Message[];      
  emojiReactions: string[];    

  constructor(sender: User, content: string) {
    this.sender = sender;
    this.content = content;
    this.timestamp = new Date().getTime();
    this.replies = [];
    this.emojiReactions = [];
  }
}

