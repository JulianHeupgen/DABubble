// thread.model.ts
import { Message } from './message.class';
import { User } from './user.class';

export class Thread {
  id: number;
  channelId: string;
  title: string;
  messages: Message[];

  constructor(id: number, channelId: string, title: string) {
    this.id = id;
    this.channelId = channelId;
    this.title = title;
    this.messages = [];
  }

  addReply(message: Message, sender: User, replyContent: string): void {
    const replyMessage = new Message(sender, replyContent);
    message.replies.push(replyMessage);
  }

  addReaction(message: Message, emoji: string, reactor: User): void {
    message.reactions.push(emoji, reactor.name);
  }

}

