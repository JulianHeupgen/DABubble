import { User } from './user.class';

export class Channel {
  title: string;
  participants: User[];
  channelId: string;
  description: string;
  createdBy: string;

  constructor(data: {
    channelId?: string,
    title?: string,
    participants?: User[],
    description?: string,
    createdBy?: string
  }) {
    this.channelId = data.channelId || '';
    this.title = data.title || '';
    this.participants = data.participants || [];
    this.description = data.description || '';
    this.createdBy = data.createdBy || '';
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


  toJSON() {
    return {
        channelId: this.channelId,
        title: this.title,
        participants: this.participants,
        description: this.description,
        createdBy: this.createdBy
    };
  }

}

