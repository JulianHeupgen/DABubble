import { Thread } from './thread.class';
import { User } from './user.class';

export class Channel {
  title: string;
  participants: User[];
  threads: Thread[];
  channelId: string;
  docId: string;

  constructor(data: {
    id?: string,
    title?: string,
    participants?: User[],
    threads?: Thread[],
    docId?: string
  }) {
    this.channelId = data.id || '';
    this.title = data.title || '';
    this.participants = data.participants || [];
    this.threads = data.threads || [];
    this.docId = data.docId || '';
  }


  addParticipant(user: User): void {
    if (!this.participants.includes(user)) {
      this.participants.push(user);
    }
  }


  removeParticipant(user: User): void {
    const index = this.participants.indexOf(user);
    if (index !== -1) {
      this.participants.splice(index, 1);
    }
  }


  addThread(thread: Thread): void {
    this.threads.push(thread);
  }

  
  removeThread(thread: Thread): void {
    const index = this.threads.indexOf(thread);
    if (index !== -1) {
      this.threads.splice(index, 1);
    }
  }

}

