import { Thread } from './thread.class';

export class UserChat {
  userChatId: string;
  chatId: string;
  participants: string[];
  threads: Thread[];

  constructor(data:  {
    userChatId?: string,
    chatId?: string,
    participants?: string [],
    threads?: Thread[]
  }) {
    this.userChatId = data.userChatId || '';
    this.chatId = data.chatId || '';
    this.participants = data.participants || [];
    this.threads = data.threads || [];
  }


  addThread(thread: Thread): void {
    this.threads.push(thread);
  }


  toJSON(): {} {
    return {
      userChatId: this.userChatId,
      chatId: this.chatId,
      participants: this.participants,
      messages: this.threads.map(thread => thread.toJSON())
    }
  }

}

