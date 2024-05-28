import { User } from './user.class';

export class Message {
  senderId: string;
  content: string;
  timestamp: Number;
  replies: Message[];
  emojiReactions: string[];
  imgFileURL: string;

  constructor(sender: User, content: string, imgFileUrl?: string) {
    this.senderId = sender.id;
    this.content = content;
    this.timestamp = new Date().getTime();
    this.replies = [];
    this.emojiReactions = [];
    this.imgFileURL = imgFileUrl !== undefined ? imgFileUrl : '';
  }

  toJSON():any {
    return {
      senderId: this.senderId,
      content: this.content,
      timestamp: this.timestamp,
      replies: this.replies.map(reply => reply.toJSON()),  
      emojiReactions: this.emojiReactions,
      imgFileURL: this.imgFileURL
    };
  }

}
