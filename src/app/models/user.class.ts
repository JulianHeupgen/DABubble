import { Channel } from "./channel.class";
import { Message } from "./message.class";
import { Thread } from "./thread.class";
import { UserChat } from "./user-chat";

export class User {
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
    this.name = data.name;
    this.email = data.email;
    this.onlineStatus = data.onlineStatus;
    this.channels = [];
    this.userChats = [];
    this.authUserId = data.authUserId;
    this.imageUrl = data.imageUrl;
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

  sendChannelMessage(channel: Channel, thread: Thread, messageContent: string): void {
    const newMessage = new Message(this, messageContent);
    thread.messages.push(newMessage);
    if (!channel.threads.includes(thread)) {
      channel.addThread(thread);
    }
  }

  sendUserChatMessage(userChat: UserChat, content: string): void {
    const sender = this;
    const recipient = userChat.participants.find(user => user !== this);
    if (recipient) {
      const newDirectMessage = new Message(sender, content);
      userChat.addMessage(newDirectMessage);
    }
  }

}

