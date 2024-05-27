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


  // getFormattedDatestamp(): any {
  //   const date = new Date(this.timestamp);
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-basiert
  //   const day = date.getDate().toString().padStart(2, '0');
    
  //   const formattedDate = `${year}-${month}-${day}`;
  //   return formattedDate;
  // }


  // neue Funktion für formatted Datestamp; Format stimmt nun mit dem in Figma überein 
  getFormattedDatestamp() {
    const date = new Date(this.timestamp);
    const month = date.getMonth(); 
    const weekday = date.getDay();
    const day = date.getDate();

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
        newMessages.push(jsonMessage);        
      } else {
        newMessages.push(message);
      }
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

