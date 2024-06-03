import { Message } from "./message.class";

export class Thread {
  threadId: string;
  channelId: string;
  messages: any[];
  timestamp: any;

  constructor(data: {
    threadId?: string,
    channelId?: string,
    messages?: any[],
    timestamp: any
  }) {
    this.threadId = data.threadId || '';
    this.channelId = data.channelId || '';
    this.messages = data.messages || [];
    this.timestamp = data.timestamp;

    if (data.messages) {
      this.messageStringtoJSON();
    }
  }


  getFormattedDatestamp() {
    const date = new Date(this.timestamp);
    const month = date.getMonth();
    const weekday = date.getDay();
    const day = date.getDate();
    const year = date.getFullYear();

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    if (todayYear === year && todayMonth === month && todayDay === day) {
      return "Heute";
    } else {
      return this.dateIsNotToday(weekday, month, day);
    }
  }


  dateIsNotToday(weekday: number, month: number, day: number) {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const weekdayName = weekdays[weekday];
    const monthName = months[month];

    const formattedDate = `${weekdayName}, ${day}. ${monthName}`;
    return formattedDate;
  }


  getFormattedTimeStamp() {
    const date = new Date(this.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes} Uhr`;

    return formattedTime;
  }


  messageStringtoJSON() {
    let newMessages: any = [];
    this.messages.forEach(message => {
      if (typeof message === 'string') {
        let jsonMessage = JSON.parse(message)
        let messageObject = this.convertMessageToOpbject(jsonMessage)
        newMessages.push(messageObject);
      } else {
        newMessages.push(message);
      }
    })
    this.messages = newMessages;
    this.sortMessagesByTimestamp();
  }

  convertMessageToOpbject(jsonMessage: any) {
    let messageObject = new Message(jsonMessage.senderId, jsonMessage.content, jsonMessage.imgFileURL);
    messageObject.senderId = jsonMessage.senderId;
    messageObject.timestamp = jsonMessage.timestamp;
    messageObject.replies = jsonMessage.replies;
    messageObject.emojiReactions = jsonMessage.emojiReactions;
    return messageObject;
  }

  sortMessagesByTimestamp() {
    return this.messages.sort((a, b) => a.timestamp - b.timestamp);
  }


  toJSON() {
    return {
      threadId: this.threadId,
      channelId: this.channelId,
      messages: this.messages.map(message => message.toJSON()),
      timestamp: this.timestamp
    }
  }

  static fromJSON(json: any): Thread { 
    const thread = new Thread({
      threadId: json.threadId,
      channelId: json.channelId,
      messages: json.messages,
      timestamp: json.timestamp
    });
    return thread;
  }

}

