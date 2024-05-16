import { Message } from './message.class';

export class Thread {
  threadId: string;
  channelId: string;
  messages: any[];
  timestamp: any;

  constructor(data: {
    id?: string,
    channelId: string,
    messages?: string[],
    timestamp: any
  }) {
    this.threadId = data.id || '';
    this.channelId = data.channelId;
    // this.messages = data.messages || [];
    this.messages = data.messages || [];
    this.timestamp = data.timestamp;

    if (data.messages) {
      this.messageStringtoJSON();
    }
    console.log('thread message:', this.messages);

  }


  getFormattedDatestamp(): any {
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

  getFormattedTimeStamp() {
    const timestampInSeconds = this.timestamp.seconds;
    const timestampInMilliseconds = timestampInSeconds * 1000;
    const date = new Date(timestampInMilliseconds);
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return formattedTime;
  }

  messageStringtoJSON() {
    let newMessages: any = [];
    this.messages.forEach(message => {
      let jsonMessage = JSON.parse(message)
      newMessages.push(jsonMessage);
    })
    this.messages = newMessages;
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

