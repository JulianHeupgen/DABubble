import { User } from './user.class';

/**
 * Represents a communication channel.
 */
export class Channel {
  title: string;
  participants: User[];
  channelId: string;
  description: string;
  createdBy: string;


   /**
   * Constructs a new Channel instance.
   * 
   * @param {Object} data - The channel data.
   * @param {string} [data.channelId] - The ID of the channel.
   * @param {string} [data.title] - The title of the channel.
   * @param {User[]} [data.participants] - The list of participants in the channel.
   * @param {string} [data.description] - The description of the channel.
   * @param {string} [data.createdBy] - The ID of the user who created the channel.
   */
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


   /**
   * Adds a participant to the channel.
   * 
   * @param {User} user - The user to add as a participant.
   */
  addParticipant(user: User): void {
    if (!this.participants.includes(user)) {
      this.participants.push(user);
    }
  }


   /**
   * Removes a participant from the channel.
   * 
   * @param {User} user - The user to remove as a participant.
   */
  removeParticipant(user: User): void {
    const index = this.participants.indexOf(user);
    if (index !== -1) {
      this.participants.splice(index, 1);
    }
  }


  /**
   * Converts the Channel instance to a JSON object.
   * 
   * @returns {Object} The JSON representation of the channel.
   */
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

