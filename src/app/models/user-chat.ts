import { Thread } from './thread.class';

/**
 * Represents a private chat with another user
 */
export class UserChat {
  userChatId: string;
  participants: string[];
  threads: Thread[];

  /**
   * Constructs a new UserChat instance.
   * 
   * @param {Object} data - The data to initialize the UserChat instance with.
   * @param {string} [data.userChatId] - The unique identifier of the user chat.
   * @param {string[]} [data.participants] - The list of participant IDs.
   * @param {any[]} [data.threads] - The list of threads in the chat.
   */
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


  /**
   * Adds a new thread to the user chat.
   * 
   * @param {Thread} thread - The thread to be added.
   */
  addThread(thread: Thread): void {
    this.threads.push(thread);
  }


   /**
   * Converts the UserChat instance to a JSON object.
   * 
   * @returns {Object} The JSON representation of the user chat.
   */
  toJSON(): {} {
    return {
      userChatId: this.userChatId,
      participants: this.participants,
      threads: this.threads.map(thread => thread.toJSON())
    }
  }

}

