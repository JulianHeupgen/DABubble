import { Channel } from "./channel.class";
import { Message } from "./message.class";
import { Thread } from "./thread.class";
import { UserChat } from "./user-chat";

export class User {
  id: string;        //  Firebase docRef id (bei User-Erstellung noch leer, wird erst später von Firestore vergeben und holen wir uns mit DataService)
  name: string;
  email: string;
  onlineStatus: 'online' | 'offline';
  channels: Channel[];
  userChats: UserChat[];
  authUserId: string;
  imageUrl: string;

  constructor(data: {
    name: string,
    email: string,
    onlineStatus: 'online' | 'offline',
    authUserId: string,
    imageUrl: string
}) {
    this.id = '';
    this.name = data.name;
    this.email = data.email;
    this.onlineStatus = data.onlineStatus;
    this.authUserId = data.authUserId;
    this.imageUrl = data.imageUrl;
    this.channels = [];  
    this.userChats = []; 
}


  joinChannel(channel: Channel): void {
    if (!this.channels.includes(channel)) {
      this.channels.push(channel);
      channel.addParticipant(this);
    }
  }


  leaveChannel(channel: Channel): void {
    const index = this.channels.indexOf(channel);
    if (index !== -1) {
      this.channels.splice(index, 1);
      channel.removeParticipant(this);
    }
  }


  changeStatus(status: 'online' | 'offline'): void {
    this.onlineStatus = status;
  }


  sendChannelMessage(channel: Channel, messageContent: string, replyToThread?: Thread): void {        // 3. Parameter (Thread) ist optional !

    if (replyToThread) {                                      // Antwort auf bestehenden Thread: Neue Message wird dem bestehenden Thread überreicht
        const newMessage = new Message(this, messageContent);
        replyToThread.messages.push(newMessage);
    } else {                                                // Andernfalls neuen Thread erstellen, Message überreichen und neuen Thread in Channel pushen
        let newThread = new Thread(channel.channelId);
        const newMessage = new Message(this, messageContent);
        newThread.messages.push(newMessage);
        channel.addThread(newThread);
    }
  }


  sendDirectMessage(recipient: User, messageContent: string): void {

    const existingUserChat = this.userChats.find(chat =>
        chat.participants.includes(recipient));                   // Prüfen ob Chat zwischen den beiden schon existiert !

    if (existingUserChat) {                                       // UserChat existiert, also Message einfach dort einfügen
        const newMessage = new Message(this, messageContent);
        existingUserChat.addMessage(newMessage);
    } else {                                                      // UserChat existiert noch nicht, also UserChat erstellen und beiden Usern hinzufügen
        const newUserChat = new UserChat([this, recipient]);
        const newMessage = new Message(this, messageContent);
        newUserChat.addMessage(newMessage);
        this.userChats.push(newUserChat);
        recipient.userChats.push(newUserChat);
    }
}


  addReply(message: Message, sender: User, replyContent: string): void {       // Auf eine ausgewählte Message direkt antworten
      const replyMessage = new Message(sender, replyContent);
      message.replies.push(replyMessage);
    }


  addReaction(message: Message, emoji: string, reactor: User): void {          // Emoji Reaction
    message.emojiReactions.push(emoji, reactor.name);
  }

}

