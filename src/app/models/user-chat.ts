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
    threads?: any []
  }) {
    this.userChatId = data.userChatId || '';
    this.chatId = data.chatId || '';
    this.participants = data.participants || [];
    this.threads = (data.threads || []).map(thread => 
      typeof thread === 'string' ? new Thread(JSON.parse(thread)) : new Thread(thread)
    );
  }


  addThread(thread: Thread): void {
    this.threads.push(thread);
  }


  toJSON(): {} {
    return {
      userChatId: this.userChatId,
      chatId: this.chatId,
      participants: this.participants,
      threads: this.threads.map(thread => thread.toJSON())
    }
  }

}

