import { User } from './user.class';

export class Message {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  replies: Message[];
  emojiReactions: string[];
  imgFileURL: string;
  editMode: boolean;
  hoverReactionbar: boolean;

  constructor(sender: Partial<User>, content: string, imgFileUrl?: string) {
    this.senderId = sender.id || '';
    this.senderName = sender.name || '';
    this.content = content;
    this.timestamp = new Date().getTime();
    this.replies = [];
    this.emojiReactions = [];
    this.imgFileURL = imgFileUrl !== undefined ? imgFileUrl : '';
    this.editMode = false;
    this.hoverReactionbar = false
  }

  toJSON(): {} {
    return {
      senderId: this.senderId,
      senderName: this.senderName,
      content: this.content,
      timestamp: this.timestamp,
      replies: this.replies.map(reply => reply.toJSON()),  
      emojiReactions: this.emojiReactions,
      imgFileURL: this.imgFileURL,
      editMode: this.editMode,
      hoverReactionbar: this.hoverReactionbar,
    };
  }

  static fromJSON(json: any): Message {
    const message = new Message(
      { id: json.senderId,
        name: json.senderName
      },
      json.content,
      json.imgFileURL
    );
    message.timestamp = json.timestamp;
    message.replies = json.replies.map((reply: any) => Message.fromJSON(reply));
    message.emojiReactions = json.emojiReactions;
    message.editMode = json.editMode;
    message.hoverReactionbar = json.hoverReactionbar;
    
    return message;
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

}

