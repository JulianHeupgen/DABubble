import { Message } from "./message.class";

/**
 * Represents a thread containing messages and reactions in a channel or private UserChat
 */
export class Thread {
  threadId: string;
  channelId: string;
  messages: any[];
  timestamp: any;

   /**
   * Constructs a new Thread instance.
   * 
   * @param {Object} data - The data to initialize the Thread instance with.
   * @param {string} [data.threadId] - The unique identifier of the thread.
   * @param {string} [data.channelId] - The unique identifier of the channel.
   * @param {any[]} [data.messages] - The list of messages in the thread.
   * @param {any} data.timestamp - The timestamp of the thread.
   */
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


   /**
   * Gets the formatted date stamp of the thread.
   * 
   * @returns {string} The formatted date stamp.
   */
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


   /**
   * Formats the date if it is not today.
   * 
   * @param {number} weekday - The day of the week.
   * @param {number} month - The month of the year.
   * @param {number} day - The day of the month.
   * @returns {string} The formatted date string.
   */
  dateIsNotToday(weekday: number, month: number, day: number) {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const weekdayName = weekdays[weekday];
    const monthName = months[month];

    const formattedDate = `${weekdayName}, ${day}. ${monthName}`;
    return formattedDate;
  }


   /**
   * Gets the formatted time stamp of the thread.
   * 
   * @returns {string} The formatted time stamp.
   */
  getFormattedTimeStamp() {
    const date = new Date(this.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes} Uhr`;

    return formattedTime;
  }


   /**
   * Converts message strings to JSON objects.
   */
  messageStringtoJSON() {
    let newMessages: any = [];
    this.messages.forEach(message => {
      if (typeof message === 'string') {
        let jsonMessage = JSON.parse(message)
        let messageObject = this.convertMessageToObject(jsonMessage)
        newMessages.push(messageObject);
      } else {
        let messageObject = this.convertMessageToObject(message); 
        newMessages.push(messageObject);
      }
    })
    this.messages = newMessages;
    this.sortMessagesByTimestamp();
  }


  /**
   * Converts a JSON message to a Message object.
   * 
   * @param {any} jsonMessage - The JSON message to convert.
   * @returns {Message} The Message object.
   */
  convertMessageToObject(jsonMessage: any) {
    let messageObject = new Message(jsonMessage.senderId, jsonMessage.content, jsonMessage.imgFileURL);
    messageObject.senderId = jsonMessage.senderId;
    messageObject.timestamp = jsonMessage.timestamp;
    messageObject.replies = jsonMessage.replies;
    messageObject.emojiReactions = jsonMessage.emojiReactions;
    return messageObject;
  }


   /**
   * Sorts the messages in the thread by their timestamp.
   * 
   * @returns {any[]} The sorted list of messages.
   */
  sortMessagesByTimestamp() {
    return this.messages.sort((a, b) => a.timestamp - b.timestamp);
  }


  /**
   * Converts the Thread instance to a JSON object.
   * 
   * @returns {Object} The JSON representation of the thread.
   */
  toJSON() {
    return {
      threadId: this.threadId,
      channelId: this.channelId,
      messages: this.messages,  
      timestamp: this.timestamp
    }
  }


  /**
   * Creates a Thread instance from a JSON object.
   * 
   * @param {any} json - The JSON object to create the Thread instance from.
   * @returns {Thread} The created Thread instance.
   */
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

