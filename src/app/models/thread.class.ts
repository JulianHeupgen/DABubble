import { Message } from './message.class';

export class Thread {
  threadId: string;
  channelId: string;
  messages: Message[];
  timestamp: any;

  constructor(data: {
    id?: string,
    channelId: string,
    messages?: Message[],
    timestamp: any
  }) {
    this.threadId = data.id || '';
    this.channelId = data.channelId;
    this.messages = data.messages || [];
    this.timestamp = data.timestamp;
  }


  getFormattedTimestamp(): any {
    const timestampInSeconds = this.timestamp.seconds; 
    const timestampInMilliseconds = timestampInSeconds * 1000;
    const date = new Date(timestampInMilliseconds); 
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short', 
      month: 'short',   
      day: 'numeric',
      year: 'numeric'   
    });
  
    return formattedDate;
  }


  toJSON() {
    return {
      threadId: this.threadId,
      channelId: this.channelId,
      messages: this.messages,
      timestamp: this.timestamp
    }
  }

}

