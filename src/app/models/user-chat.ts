import { Thread } from './thread.class';

export class UserChat {
  userChatId: string;
  participants: string[];
  threads: Thread[];

  constructor(data:  {
    userChatId?: string,
    chatId?: string,
    participants?: string [],
    threads?: any []
  }) {
    this.userChatId = data.userChatId || '';
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
      participants: this.participants,
      threads: this.threads.map(thread => thread.toJSON())
    }
  }

}

