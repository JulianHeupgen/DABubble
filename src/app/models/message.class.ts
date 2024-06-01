import { User } from './user.class';

export class Message {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Number;
  replies: Message[];
  emojiReactions: string[];
  imgFileURL: string;
  editMode: boolean;
  hoverReactionbar: boolean;

  constructor(sender: User, content: string, imgFileUrl?: string) {
    this.senderId = sender.id;
    this.senderName = sender.name;
    this.content = content;
    this.timestamp = new Date().getTime();
    this.replies = [];
    this.emojiReactions = [];
    this.imgFileURL = imgFileUrl !== undefined ? imgFileUrl : '';
    this.editMode = false;
    this.hoverReactionbar = false
  }

  toJSON(): {} {
    return {
      senderId: this.senderId,
      senderName: this.senderName,
      content: this.content,
      timestamp: this.timestamp,
      replies: this.replies.map(reply => reply.toJSON()),  
      emojiReactions: this.emojiReactions,
      imgFileURL: this.imgFileURL,
      editMode: this.editMode,
      hoverReactionbar: this.hoverReactionbar,
    };
  }

}
