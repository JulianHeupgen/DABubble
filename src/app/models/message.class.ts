import { reload } from '@angular/fire/auth';
import { User } from './user.class';

export class Message {
  sender: User;
  content: string;
  timestamp: Number;
  replies: Message[];      
  emojiReactions: string[]; 
  imgFileURL: string;   

  constructor(sender: User, content: string, imgFileUrl?: string) {
    this.sender = sender;
    this.content = content;
    this.timestamp = new Date().getTime();
    this.replies = [];
    this.emojiReactions = [];
    this.imgFileURL = imgFileUrl !== undefined ? imgFileUrl : '';
  }

}
