import { Channel } from "./channel.class";
import { Message } from "./message.class";
import { Thread } from "./thread.class";
import { UserChat } from "./user-chat";

export class User {
  id: string;
  name: string;
  email: string;
  onlineStatus: 'online' | 'offline' | 'away';
  channels: string[]; 
  userChats: UserChat[]; 
  authUserId: string;
  imageUrl: string;
  userChatId: string[];

  constructor(data: {
    id: string,
    name: string,
    email: string,
    onlineStatus: 'online' | 'offline' | 'away',
    authUserId: string,
    imageUrl: string,
    channels: string[],
    userChats: UserChat[],
    userChatId: string[]
}) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.onlineStatus = data.onlineStatus;
    this.authUserId = data.authUserId;
    this.imageUrl = data.imageUrl;
    this.channels = data.channels;
    this.userChats = data.userChats || [];
    this.userChatId = data.userChatId || [];
}


  joinChannel(channelId: string, channel: Channel): void {
    if (!this.channels.includes(channelId)) {
      this.channels.push(channelId);
      channel.addParticipant(this);
    }
  }


  leaveChannel(channelId: string, channel: Channel): void {
    const index = this.channels.indexOf(channelId);
    if (index !== -1) {
      this.channels.splice(index, 1);
      channel.removeParticipant(this);
    }
  }


  changeStatus(status: 'online' | 'offline' | 'away'): void {
    this.onlineStatus = status;
  }


  // Diese Funktion hier nutzen, wenn in einem Channel ein Beitrag verfasst oder dort auf einen Thread geantwortet wird

  sendChannelMessage(channel: Channel, messageContent: string, replyToThread?: Thread): void {        // 3. Parameter (Thread) ist optional !

    if (replyToThread) {                                      // Antwort auf bestehenden Thread: Neue Message wird dem bestehenden Thread überreicht
        const newMessage = new Message(this, messageContent);
        replyToThread.messages.push(newMessage);
        console.log('newMessage:', newMessage);
        console.log('replyToThread', replyToThread);


    } else {                                                // Andernfalls neuen Thread erstellen, Message überreichen und neuen Thread in Channel pushen
        let newThread = new Thread( { channelId: channel.channelId, timestamp: new Date().getTime() } );
        const newMessage = new Message(this, messageContent);
        newThread.messages.push(newMessage);
        channel.addThread(newThread);
        console.log('newMessage:', newMessage);
        console.log('Date:', new Date().getTime());
        console.log('newThread:', channel.threads);
    }
  }


  // Diese Funktion hier nutzen wenn eine Direktnachricht an einen anderen User gesendet wird

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

