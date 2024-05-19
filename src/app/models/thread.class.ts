import { Message } from './message.class';

export class Thread {
  threadId: string;
  channelId: string;
  messages: any[];
  timestamp: any;

  constructor(data: {
    threadId?: string,
    channelId: string,
    messages?: string[],
    timestamp: any
  }) {
    this.threadId = data.threadId || '';
    this.channelId = data.channelId;
    this.messages = data.messages || [];
    this.timestamp = data.timestamp;

    if (data.messages) {
      this.messageStringtoJSON();
    }
  }


  getFormattedDatestamp(): any {
    // const timestampInSeconds = this.timestamp;
    // const timestampInMilliseconds = timestampInSeconds * 1000;
    // const formattedDate = date.toLocaleDateString('en-US', {
    //   weekday: 'short',
    //   month: 'short',
    //   day: 'numeric',
    //   year: 'numeric'
    // });
    const date = new Date(this.timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-basiert
    const day = date.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getFormattedTimeStamp() {
    // const timestampInSeconds = this.timestamp;
    // const timestampInMilliseconds = timestampInSeconds * 1000;
    const date = new Date(this.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes} Uhr`;

    return formattedTime;
  }

  messageStringtoJSON() {
    let newMessages: any = [];
    this.messages.forEach(message => {
      let jsonMessage = JSON.parse(message)
      newMessages.push(jsonMessage);
    })
    this.messages = newMessages;
    this.sortMessagesByTimestamp();
    
  }

  sortMessagesByTimestamp() {
    return this.messages.sort((a, b) => a.timestamp - b.timestamp);
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

